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

export const FlightDefinition: IFormDefinition = {
    groups: [{
        children: [{
            key: "reservationId",
            required: true,
            title: "Reservation ID",
            type: "string",
        }, {
            key: "flightNumber",
            required: true,
            title: "Flight number",
            type: "string",
        }],
    }, {
        children: [{
            key: "departureIATA",
            required: true,
            title: "Airport code",
            type: "string",
        }, {
            key: "departureTime",
            required: true,
            title: "Date",
            type: "datetime",
        }],
        title: "Departure",
    }, {
        children: [{
            key: "arrivalIATA",
            required: true,
            title: "Airport code",
            type: "string",
        }, {
            key: "arrivalTime",
            required: true,
            title: "Date",
            type: "datetime",
        }],
        title: "Arrival",
    }],
    icon: "plane",
    name: "Flight",
};

export const HotelDefinition: IFormDefinition = {
    groups: [{
        children: [{
            key: "reservationId",
            required: true,
            title: "Reservation ID",
            type: "string",
        }, {
            key: "name",
            required: false,
            title: "Hotel name",
            type: "string",
        }],
    }, {
        children: [{
            key: "address",
            required: true,
            title: "Address",
            type: "string",
        }, {
            key: "telephone",
            required: true,
            title: "Telephone",
            type: "tel",
        }],
    }, {
        children: [{
            key: "checkIn",
            required: true,
            title: "Check In",
            type: "datetime",
        }, {
            key: "checkOut",
            required: true,
            title: "Check Out",
            type: "datetime",
        }],
    }],
    icon: "hotel",
    name: "Hotel",
};
