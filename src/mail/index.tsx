import update from "immutability-helper";
import findIndex from "lodash.findindex";
import flatten from "lodash.flatten";
import get from "lodash.get";
import React from "react";
import { Grid, Label, Search, Tab } from "semantic-ui-react";
import { updateState } from "../util";
import { ConnectedSearchMailBox } from "./search";

const panes = [{
    menuItem: {
        content: "Compose",
        icon: "compose",
        key: "compose",
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
    receivers: IReceiver[];
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

export class MailEditor extends React.Component<{}, IStates> {
    private static getCacheKey() {
        const userId = gapi.auth2.getAuthInstance().currentUser.get().getId();
        return `cached-contacts-${userId}`;
    }

    constructor(props: {}, context: any) {
        super(props, context);

        this.state = {
            contacts: [],
            contactsFetching: false,
            contactsInitialized: false,
            receivers: [],
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
            await updateState(this, {
                contacts: {
                    $push: flatten(resp.result.connections.map(Contact.fromPerson)),
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
        }));
    }

    private onReceiverRemove(idx: number) {
        this.setState((state) => update(state, {
            receivers: {
                $splice: [[idx, 1]],
            },
        }));
    }

    public render() {
        return <Grid textAlign="left">
            <Grid.Row>
                <Grid.Column>
                    {this.state.receivers.map((receiver, idx) => <Label
                        key={`receiver-${idx}`} image as="a"
                        onClick={this.onReceiverRemove.bind(this, idx)}
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
                            results={this.state.contacts}
                            onResultSelect={this.onReceiverSelected.bind(this)}
                        />
                    </div>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row>
                <Grid.Column>
                    <Tab panes={panes} />
                </Grid.Column>
            </Grid.Row>
        </Grid>;
    }
}
