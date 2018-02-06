import get from "lodash.get";
import React from "react";
import { Grid, Icon, Label, Search, Tab } from "semantic-ui-react";
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
    emails: string[];
    image: string;
}

namespace Contact {
    export function fromPerson(person: gapi.client.people.people.Person): IContact {
        return {
            emails: get(person, "emailAddresses", [] as gapi.client.people.people.EmailAddress[])!.map((e) => e.value!),
            image: person.photos![0].url!,
            key: person.resourceName!,
            title: person.names![0].displayName!,
        };
    }
}

export class MailEditor extends React.Component<{}, IStates> {
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
            this.fetchConnects();
        }
    }

    protected async fetchConnects(token?: string) {
        await updateState(this, {
            contactsFetching: {
                $set: true,
            },
            contactsInitialized: {
                $set: true,
            },
        });
        const resp = await gapi.client.people.people.connections.list({
            pageToken: token,
            personFields: [
                "photos", "names", "emailAddresses",
            ].join(","),
            resourceName: "people/me",
        });

        if (resp.result.connections) {
            await updateState(this, {
                contacts: {
                    $push: resp.result.connections.map(Contact.fromPerson),
                },
                contactsFetching: {
                    $set: false,
                },
                contactsInitialized: {
                    $set: true,
                },
            });
        }
        if (resp.result.nextPageToken) {
            this.fetchConnects(resp.result.nextPageToken);
        }
    }

    public render() {
        return <Grid>
            <Grid.Row>
                <Grid.Column>
                    {this.state.receivers.map((receiver) => <Label as="a">
                        {receiver.name}&lt;{receiver.mail}&gt;
                        <Icon name="delete" />
                    </Label>)}
                    <Search loading={this.state.contactsFetching} results={this.state.contacts} />
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
