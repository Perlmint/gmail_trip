import { SemanticICONS } from "semantic-ui-react";

export interface IDefinitionGroup {
    children: IDefinitionItem[];
    title?: string;
}

export interface IDefinitionItem {
    key: string;
    title: string;
    required?: boolean;
    type: "string" | "number" | "datetime" | "tel";
    help?: string;
}

export interface IFormDefinition {
    name: string;
    icon: SemanticICONS;
    groups: IDefinitionGroup[];
}

export interface IMetaData {
    definition: IFormDefinition;
    data: any;
}
