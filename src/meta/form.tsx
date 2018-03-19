import update from "immutability-helper";
import flatten from "lodash.flatten";
import fromPairs from "lodash.frompairs";
import PropTypes from "prop-types";
import React from "react";
import Form from "semantic-ui-react/dist/commonjs/collections/Form";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Header from "semantic-ui-react/dist/commonjs/elements/Header";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import { IFormDefinition } from "./definition";

export interface IMetadataFormProps {
    definition: IFormDefinition;
}

interface IStates {
    form: {[key: string]: string};
}

export class MetadataForm extends React.Component<IMetadataFormProps, IStates> {
    constructor(props: IMetadataFormProps, context: any) {
        super(props, context);

        this.state = {
            form: this.initForm(props),
        };
    }

    protected static contextTypes = {
        addData: PropTypes.func,
    };

    private onChangeForm(key: string, data: string) {
        this.setState((state) => update(state, {
            form: {
                [key]: {
                    $set: data,
                },
            },
        }));
    }

    private onAddClicked() {
        this.context.addData(this.props.definition, this.state.form);
        this.setState((state) => update(state, {
            form: {
                $set: this.initForm(this.props),
            },
        }));
    }

    private initForm(props: IMetadataFormProps) {
        return fromPairs(
            flatten(
                props.definition.groups.map(
                    (group) => group.children.map(
                        (field) => [field.key, ""],
                    ),
                ),
            ),
        );
    }

    public render() {
        return <Grid textAlign="left">
            <Grid.Row>
                <Grid.Column>
                    <Form onSubmit={this.onAddClicked.bind(this)}>
                        {this.props.definition.groups.map((def, idx) => [
                            def.title && <Header key={`form-group-header-${idx}`} size="medium">{def.title}</Header>,
                            <Form.Group key={`form-group-${idx}`} widths="equal">
                                {def.children.map((field) => <Form.Input
                                    key={field.key} label={field.title} value={this.state.form[field.key]}
                                    placeholder={field.help}
                                    onChange={(__, data) => this.onChangeForm(field.key, data.value)}
                                    required={field.required} />,
                                )}
                            </Form.Group>,
                        ])}
                        <Form.Button icon floated="right">
                            <Icon name="plus"/>
                            Add
                        </Form.Button>
                    </Form>
                </Grid.Column>
            </Grid.Row>
        </Grid>;
    }
}

export { IFormDefinition };
