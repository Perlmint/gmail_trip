import update from "immutability-helper";
import findIndex from "lodash.findindex";
import flatten from "lodash.flatten";
import get from "lodash.get";
import PropTypes from "prop-types";
import React from "react";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Header from "semantic-ui-react/dist/commonjs/elements/Header";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Label from "semantic-ui-react/dist/commonjs/elements/Label";
import Search from "semantic-ui-react/dist/commonjs/modules/Search";
import Tab from "semantic-ui-react/dist/commonjs/modules/Tab";
import { b64EncodeUnicode, quotedPrintable, updateState, webSafeBase64 } from "../util";
import { MailComposer } from "./compose";
import { ConnectedSearchMailBox } from "./search";

const panes = [{
    menuItem: {
        content: "Compose",
        icon: "compose",
        key: "compose",
    },
    render() {
        return <MailComposer />;
    },
}, {
    menuItem: {
        content: "Forward",
        icon: "mail forward",
        key: "forward",
    },
    render() {
        return <ConnectedSearchMailBox />;
    },
}];

interface IReceiver {
    image: string;
    name: string;
    mail: string;
}

interface IStates {
    contacts: IContact[];
    contactsFetching: boolean;
    contactsInitialized: boolean;
    contents: string;
    receivers: IReceiver[];
    searchResults: IContact[];
    searchValue: string;
    sending: boolean;
    subject: string;
}

interface IContact {
    key: string;
    title: string;
    description: string;
    image: string;
}

namespace Contact {
    export function fromPerson(person: gapi.client.people.people.Person): IContact[] {
        return get(
            person,
            "emailAddresses",
            [] as gapi.client.people.people.EmailAddress[],
        )!.map((email, idx) => ({
            description: email.value!,
            image: person.photos![0].url!,
            key: person.resourceName! + "/" + idx.toString(),
            title: person.names![0].displayName!,
        }));
    }
}

export default class MailEditor extends React.Component<{}, IStates> {
    private static getCacheKey() {
        const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
        return `cached-contacts-${userId}`;
    }

    protected static childContextTypes = {
        getContents: PropTypes.func,
        setContents: PropTypes.func,
    };

    protected static contextTypes = {
        getMetaData: PropTypes.func,
    };

    constructor(props: {}, context: any) {
        super(props, context);

        this.state = {
            contacts: [],
            contactsFetching: false,
            contactsInitialized: false,
            contents: "",
            receivers: [],
            searchResults: [],
            searchValue: "",
            sending: false,
            subject: "",
        };
    }

    public componentDidMount() {
        if (!this.state.contactsInitialized) {
            const cachedContacts = localStorage.getItem(MailEditor.getCacheKey());
            if (cachedContacts != null) {
                const contacts = JSON.parse(cachedContacts) as IContact[];
                const token = localStorage.getItem(MailEditor.getCacheKey() + "-token")!;
                updateState(this, {
                    contacts: {
                        $set: contacts,
                    },
                }).then(() => this.fetchConnects(undefined, token));
            } else {
                this.fetchConnects();
            }
        }
    }

    public getChildContext() {
        return {
            getContents: this.getContents.bind(this),
            setContents: this.setContents.bind(this),
        };
    }

    protected getContents() {
        return {
            contents: this.state.contents,
            subject: this.state.subject,
        };
    }

    protected setContents(field: "subject" | "contents", value: string) {
        this.setState((state) => update(state, {
            [field]: { $set: value },
        }));
    }

    protected async fetchConnects(pageToken?: string, syncToken?: string) {
        await updateState(this, {
            contactsFetching: {
                $set: true,
            },
            contactsInitialized: {
                $set: true,
            },
        });
        const resp = await gapi.client.people.people.connections.list({
            pageToken,
            personFields: [
                "photos", "names", "emailAddresses",
            ].join(","),
            requestSyncToken: true,
            resourceName: "people/me",
            syncToken,
        });
        await updateState(this, {
            contactsFetching: {
                $set: false,
            },
        });

        if (resp.result.nextSyncToken) {
            localStorage.setItem(MailEditor.getCacheKey() + "-token", resp.result.nextSyncToken);
        }

        if (resp.result.connections) {
            const people = flatten(resp.result.connections.map(Contact.fromPerson));
            const added: IContact[] = [];
            const changed: Array<[number, number, IContact]> = [];
            for (const person of people) {
                const idx = findIndex(this.state.contacts, (c) => person.key === c.key);
                if (idx === -1) {
                    added.push(person);
                } else {
                    changed.push([idx, 1, person]);
                }
            }
            await updateState(this, {
                contacts: {
                    $push: added,
                    $splice: changed,
                },
            });
        }
        if (resp.result.nextPageToken) {
            this.fetchConnects(resp.result.nextPageToken);
        } else {
            // last page!
            // cache contacts
            localStorage.setItem(
                MailEditor.getCacheKey(),
                JSON.stringify(this.state.contacts),
            );
        }
    }

    private onReceiverSelected(__: any, data: { result: IContact }) {
        if (findIndex(this.state.receivers, (r) => r.mail === data.result.description) !== -1) {
            return;
        }
        this.setState((state) => update(state, {
            receivers: {
                $push: [{
                    image: data.result.image,
                    mail: data.result.description,
                    name: data.result.title,
                }],
            },
            searchValue: { $set: "" },
        }));
    }

    private onReceiverSearch(__: any, data: { value: string; }) {
        this.setState((state) => update(state, {
            searchValue: { $set: data.value },
        }));
        const searchResult = data.value.length > 0 ? this.state.contacts.filter(
            (contact) => (
                contact.description.indexOf(data.value) !== -1 ||
                contact.title.indexOf(data.value) !== -1
            ),
        ) : [];
        this.setState((state) => update(state, {
            searchResults: {
                $set: searchResult,
            },
        }));
    }

    private onReceiverRemove(idx: number) {
        this.setState((state) => update(state, {
            receivers: {
                $splice: [[idx, 1]],
            },
        }));
    }

    private async send() {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const boundaryGen: string[] = [];
        for (let i = 0; i < 32;) {
            const p = (Math.floor(Math.random() * 0xFF)).toString(16);
            boundaryGen.push(p);
            i += p.length;
        }
        const boundary = boundaryGen.join("");
        const mail = [
            `Message-id: ${new Date().getTime()}@gmail.trip.${user.getId()}`,
            `Date: ${new Date().toUTCString()}`,
            `Subject: =?utf-8?Q?${quotedPrintable(this.state.subject)}?=`,
            `From: ${user.getBasicProfile().getEmail()}`,
            `To: ${this.state.receivers.map((r) => r.mail).join(", ")}`,
            `Content-Type: multipart/alternative; boundary="${boundary}"`,
            "",
            `--${boundary}`,
            "Content-Type: plain/text; charset=\"UTF-8\"",
            "Content-Transfer-Encoding: BASE64",
            b64EncodeUnicode(this.state.contents),
            "",
            `--${boundary}`,
            "Content-Type: text/html; charset=\"UTF-8\"",
            "Content-Transfer-Encoding: BASE64",
            b64EncodeUnicode([
                "<html><body>",
                this.state.contents,
                "<script type=\"application/ld+json\">",
                JSON.stringify(this.context.getMetaData()),
                "</script></body></html>",
            ].join("")),
            `--${boundary}--`,
        ].join("\r\n");
        await updateState(this, {
            sending: { $set: true },
        });
        await gapi.client.gmail.users.messages.send({
            resource: {
                raw: webSafeBase64(b64EncodeUnicode(mail)),
            },
            userId: "me",
        });
        await updateState(this, {
            contents: { $set: "" },
            receivers: { $set: [] },
            sending: { $set: false },
            subject: { $set: "" },
        });
    }

    public render() {
        return <Grid textAlign="left">
            <Grid.Row>
                <Grid.Column>
                    <Header size="medium">Receivers</Header>
                    {this.state.receivers.map((receiver, idx) => <Label
                        key={`receiver-${idx}`} image as="a"
                        onClick={this.onReceiverRemove.bind(this, idx)}
                        disabled={this.state.sending}
                    >
                        <img src={receiver.image} />
                        {receiver.name}
                        <Label.Detail>
                            {receiver.mail}
                        </Label.Detail>
                    </Label>)}
                    <div style={{display: "inline-block"}}>
                        <Search
                            loading={this.state.contactsFetching}
                            results={this.state.searchResults}
                            value={this.state.searchValue}
                            onResultSelect={this.onReceiverSelected.bind(this)}
                            onSearchChange={this.onReceiverSearch.bind(this)}
                            disabled={this.state.sending}
                        />
                    </div>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Tab panes={panes} disabled={this.state.sending} />
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Button
                        icon floated="right"
                        onClick={this.send.bind(this)}
                        disabled={this.state.receivers.length === 0 || this.state.sending}
                    >
                        <Icon name="send" />
                        Send
                    </Button>
                </Grid.Column>
            </Grid.Row>
        </Grid>;
    }
}
