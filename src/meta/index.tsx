import update from "immutability-helper";
import snakeCase from "lodash.snakecase";
import PropTypes from "prop-types";
import React, { ReactElement } from "react";
import { SemanticICONS } from "semantic-ui-react/dist/commonjs";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Button from "semantic-ui-react/dist/commonjs/elements/Button";
import Divider from "semantic-ui-react/dist/commonjs/elements/Divider";
import Icon from "semantic-ui-react/dist/commonjs/elements/Icon";
import Tab from "semantic-ui-react/dist/commonjs/modules/Tab";
import Card from "semantic-ui-react/dist/commonjs/views/Card";
import { FlightDefinition, HotelDefinition, IFormDefinition } from "./definition";
import { MetadataForm } from "./form";
import { MetadataView } from "./view";

export interface IMetaData {
    definition: IFormDefinition;
    data: any;
}

interface IStates {
    metaData: IMetaData[];
}

interface ITab {
    menuItem: {
        key: string,
        icon: SemanticICONS,
        content: string,
    };
    render(): ReactElement<any>;
}

function tabFromDefinition(definition: IFormDefinition): ITab {
    return {
        menuItem: {
            content: definition.name,
            icon: definition.icon,
            key: snakeCase(definition.name),
        },
        render() {
            return <MetadataForm definition={definition} />;
        },
    };
}

const tabs: ITab[] = [FlightDefinition, HotelDefinition].map(tabFromDefinition);

export class MetadataEditor extends React.Component<{}, IStates> {
    constructor(props: {}, context: any) {
        super(props, context);

        this.state = {
            metaData: [],
        };
    }

    protected static childContextTypes = {
        addData: PropTypes.func,
        removeData: PropTypes.func,
    };

    protected static contextTypes = {
        setMetaData: PropTypes.func,
    };

    public getChildContext() {
        return {
            addData: this.onDataAdd.bind(this),
            removeData: this.onDataRemove.bind(this),
        };
    }

    protected onDataAdd(definition: IFormDefinition, data: any) {
        this.setState((state) => update(state, {
            metaData: {
                $push: [{
                    data,
                    definition,
                }],
            },
        }));
    }

    protected onDataRemove(idx: number) {
        this.setState((state) => update(state, {
            metaData: {
                $splice: [[idx, 1]],
            },
        }));
    }

    protected onNextClicked() {
        this.context.setMetaData(this.state.metaData);
    }

    public render() {
        return <Grid textAlign="left">
            <Grid.Row>
                <Grid.Column>
                    <Tab panes={tabs}/>
                </Grid.Column>
            </Grid.Row>
            {this.state.metaData.length > 0 &&
                [<Grid.Row key="created">
                    <Grid.Column>
                        <Divider horizontal></Divider>
                        <Card.Group>
                            {this.state.metaData.map((data, idx) =>
                                <MetadataView
                                    key={`metadata-${idx}`} definition={data.definition}
                                    data={data.data} idx={idx}
                                />,
                            )}
                        </Card.Group>
                    </Grid.Column>
                </Grid.Row>,
                <Grid.Row key="nextButton">
                    <Grid.Column>
                        <Button icon floated="right" onClick={this.onNextClicked.bind(this)}>
                            Next
                            <Icon name="angle double right"/>
                        </Button>
                    </Grid.Column>
                </Grid.Row>]
            }
        </Grid>;
    }
}
