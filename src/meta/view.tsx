import flatten from "lodash.flatten";
import PropTypes from "prop-types";
import React from "react";
import { Button, Card, Icon, List } from "semantic-ui-react";
import { IFormDefinition } from "./definition";

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
