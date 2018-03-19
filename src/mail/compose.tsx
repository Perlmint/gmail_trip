import update from "immutability-helper";
import React from "react";
import { Form } from "semantic-ui-react";

interface IStates {
    subject: string;
    contents: string;
}

export class MailComposer extends React.Component<{}, IStates> {
    public state = {
        contents: "",
        subject: "",
    };

    protected changeField(field: keyof IStates, value: string) {
        this.setState((state) => update(state, {
            [field]: { $set: value },
        }));
    }

    public render() {
        return <Form>
            <Form.Input
                label="Subject"
                onChange={(_, data) => this.changeField("subject", data.value)}
                content={this.state.subject}
            />
            <Form.TextArea
                label="Contents"
                onChange={(_, data) => this.changeField("contents", data.value as string)}
                content={this.state.contents}
            />
        </Form>;
    }
}
