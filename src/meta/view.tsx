import flatten from "lodash.flatten";
import PropTypes from "prop-types";
import React from "react";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import List from "semantic-ui-react/dist/commonjs/elements/List";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import { IFormDefinition } from "./type";

interface IProps {
    definition: IFormDefinition;
    data: any;
    idx: number;
}

function MetadataView(props: IProps, context: any) {
    return <Card>
        <Card.Content>
            <Card.Header>
                {props.definition.name}
                <div style={{float: "right"}}><Icon size="large" name={props.definition.icon}/></div>
            </Card.Header>
            <Card.Description>
                <List>
                    {flatten(props.definition.groups.map((group) =>
                        group.children.map((item) =>
                            <List.Item key={item.key}>
                                <List.Header>{[group.title, item.title].join(" ")}</List.Header>
                                {props.data[item.key]}
                            </List.Item>,
                        ),
                    ))}
                </List>
            </Card.Description>
            <Card.Content extra>
                <Button fluid basic color="red" onClick={() => context.removeData(props.idx)}>Remove</Button>
            </Card.Content>
        </Card.Content>
    </Card>;
}

namespace MetadataView {
    export const contextTypes = {
        removeData: PropTypes.func,
    };
}

export { MetadataView };
