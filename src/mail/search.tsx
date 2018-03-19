import { Query } from "immutability-helper";
import findIndex from "lodash.findindex";
import get from "lodash.get";
import React from "react";
import Portal from "semantic-ui-react/dist/commonjs/addons/Portal";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Table from "semantic-ui-react/dist/commonjs/collections/Table";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Header from "semantic-ui-react/dist/commonjs/elements/Header";
import Input from "semantic-ui-react/dist/commonjs/elements/Input";
import Loader from "semantic-ui-react/dist/commonjs/elements/Loader";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Dimmer from "semantic-ui-react/dist/commonjs/modules/Dimmer";
import { connect, Connected } from "../reducer";
import { updateState } from "../util";

interface IProps extends Connected<"auth"> {

}

interface IMail {
    id: string;
    sender?: string;
    title?: string;
    snippet?: string;
}

interface IState {
    query?: string;
    pageToken?: string;
    prevToken?: string;
    nextToken?: string;
    mails: IMail[];
    fetching: boolean;
    selected?: IMail;
}

class SearchMailBox extends React.Component<IProps, IState> {
    constructor(props: IProps, context?: any) {
        super(props, context);

        this.state = {
            fetching: false,
            mails: [],
        };
    }

    private async fetchMailsList(token?: string) {
        await updateState(this, {
            fetching: { $set: true },
        });

        const resp = await gapi.client.gmail.users.messages.list({
            maxResults: 20,
            pageToken: token,
            q: this.state.query,
            userId: "me",
        });

        await updateState(this, {
            mails: { $set: resp.result.messages },
            nextToken: { $set: resp.result.nextPageToken },
            pageToken: { $set: this.state.nextToken },
            prevToken: { $set: this.state.pageToken },
        });

        await this.fetchMails();
    }

    private async fetchMails() {
        const batch = gapi.client.newBatch<gapi.client.gmail.users.messages.MessageDetail>();
        for (const mail of this.state.mails) {
            batch.add(gapi.client.gmail.users.messages.get({
                format: "metadata",
                id: mail.id,
                metadataHeaders: ["From", "Subject"],
                userId: "me",
            }));
        }

        const updateSpec: Query<IState> = { mails: {}, fetching: { $set: false } };
        for (const mail of Object.values((await batch).result)) {
            let title: string | undefined;
            let sender: string | undefined;
            for (const header of mail.result.payload.headers) {
                switch (header.name) {
                    case "From":
                        sender = header.value;
                        break;
                    case "Subject":
                        title = header.value;
                        break;
                }
            }

            const idx = findIndex(this.state.mails, (m) => m.id === mail.result.id);
            (updateSpec as any).mails[idx] = {
                sender: { $set: sender },
                snippet: { $set: mail.result.snippet },
                title: { $set: title },
            };
        }

        await updateState(this, updateSpec);
    }

    private async onSearchClicked() {
        const query = ((this.refs.search as any).inputRef as HTMLInputElement).value;
        if (this.state.query !== query) {
            await updateState(this, {
                pageToken: {
                    $set: undefined,
                },
                query: {
                    $set: query,
                },
            });
        } else {
            return;
        }

        this.fetchMailsList();
    }

    private onRowClicked(index: number) {
        updateState(this, {
            selected: { $set: this.state.mails[index] },
        });
    }

    private closeDetail() {
        updateState(this, {
            selected: { $set: undefined },
        });
    }

    private renderDetail() {
        const selected = this.state.selected !== undefined;
        return <Portal onClose={() => this.closeDetail()} open={selected}>
            <Grid
                textAlign="center"
                style={{ position: "fixed", height: "100%", top: 0, margin: 0 }}
                verticalAlign="middle"
            >
                <Dimmer active={selected} onClick={() => this.closeDetail()} inverted/>
                <Grid.Column style={{ width: "60%" }}>
                    <Segment style={{ zIndex: 1000 }}>
                        <Header>{get(this.state.selected, "title")}</Header>
                        <p>{get(this.state.selected, "snippet")}</p>
                    </Segment>
                </Grid.Column>
            </Grid>
        </Portal>;
    }

    private renderMails() {
        const emptyData = this.state.mails.length === 0;
        return <Table compact celled selectable>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>From</Table.HeaderCell>
                    <Table.HeaderCell>Title</Table.HeaderCell>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {
                    (emptyData || this.state.fetching) ? <Table.Row>
                        <Table.Cell colSpan="2">{ this.state.fetching ? this.renderLoading() : "No Data" }</Table.Cell>
                    </Table.Row> : this.state.mails.map((mail, idx) =>
                    <Table.Row key={idx} onClick={this.onRowClicked.bind(this, idx)}>
                        <Table.Cell>{mail.sender}</Table.Cell>
                        <Table.Cell>{mail.title}</Table.Cell>
                    </Table.Row>)
                }
            </Table.Body>

            <Table.Footer fullWidth>
                <Table.Row>
                    <Table.HeaderCell colSpan="2">
                        <Input focus placeholder="Search keywords" floated="right" ref="search" action={{
                            color: "teal", icon: "search", onClick: () => this.onSearchClicked(),
                        }}/>
                        <Button
                            size="small" disabled={this.state.nextToken === undefined}
                            onClick={() => this.fetchMailsList(this.state.nextToken)}>
                            Next
                        </Button>
                        <Button
                            size="small" disabled={this.state.prevToken === undefined}
                            onClick={() => this.fetchMailsList(this.state.prevToken)}>
                            Prev
                        </Button>
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Footer>
        </Table>;
    }

    private renderLoading() {
        return <Dimmer active inverted>
            <Loader inverted>Loading</Loader>
        </Dimmer>;
    }

    public render() {
        return <div>
            { this.renderMails() }
            { this.renderDetail() }
        </div>;
    }
}

export const ConnectedSearchMailBox = connect(SearchMailBox, "auth");
