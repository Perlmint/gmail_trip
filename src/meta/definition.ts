import { IFormDefinition } from "./type";

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
