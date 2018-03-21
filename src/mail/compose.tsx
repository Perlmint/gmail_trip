import update from "immutability-helper";
import PropTypes from "prop-types";
import React from "react";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";

interface IStates {
    subject: string;
    contents: string;
}

export class MailComposer extends React.Component<{}, IStates> {
    protected static contextTypes = {
        getContents: PropTypes.func,
        setContents: PropTypes.func,
    };

    public state = {
        contents: "",
        subject: "",
    };

    public componentDidMount() {
        this.setState((state) => update(state, {
            $merge: this.context.getContents(),
        }));
    }

    protected changeField(field: keyof IStates, value: string) {
        this.context.setContents(field, value);
        this.setState((state) => update(state, {
            [field]: { $set: value },
        }));
    }

    public render() {
        return <Form>
            <Form.Input
                label="Subject"
                onChange={(_, data) => this.changeField("subject", data.value)}
                value={this.state.subject}
            />
            <Form.TextArea
                label="Contents"
                onChange={(_, data) => this.changeField("contents", data.value as string)}
                value={this.state.contents}
            />
        </Form>;
    }
}
