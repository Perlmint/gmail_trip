import { findByIATA as findByAirlineIATA } from "data/airline";
import { findByIATA as findByAirportIATA } from "data/airport";

// tslint:disable:object-literal-sort-keys
export async function flightToLDJson(data: any, name: string) {
    const iata = data.flightNumber.substring(0, 2);
    const airline = (await findByAirlineIATA(iata))!.name;
    return {
        "@context": "http://schema.org",
        "@type": "FlightReservation",
        "reservationNumber": data.reservationId,
        "reservationStatus": "http://schema.org/ReservationConfirmed",
        "reservationFor": {
          "@type": "Flight",
          "flightNumber": data.flightNumber,
          "provider": {
            "@type": "Airline",
            "iataCode": iata,
            "name": airline,
          },
          "airline": {
            "@type": "Airline",
            "iataCode": iata,
            "name": airline,
          },
          "departureAirport": {
            "@type": "Airport",
            "iataCode": data.departureIATA,
            "name": (await findByAirportIATA(data.departureIATA))!.name,
          },
          "departureTime": data.departureTime,
          "arrivalAirport": {
            "@type": "Airport",
            "iataCode": data.arrivalIATA,
            "name": (await findByAirportIATA(data.arrivalIATA))!.name,
          },
          "arrivalTime": data.arrivalTime,
        },
        "underName": {
            "@type": "Person",
            "name": name,
        },
    };
}

export async function hotelToLDJson(data: any, name: string) {
    return {
        "@context": "http://schema.org",
        "@type": "LodgingReservation",
        "reservationNumber": data.reservationId,
        "reservationStatus": "http://schema.org/ReservationConfirmed",
        "reservationFor": {
          "@type": "LodgingBusiness",
          "name": data.name,
          "address": data.address,
          "telephone": data.telephone,
        },
        "checkinDate": data.checkIn.toISOString(),
        "checkoutDate": data.checkOut.toISOString(),
        "underName": {
            "@type": "Person",
            "name": name,
        },
    };
}

export async function packageToLDJson(data: any[], name: string) {
    if (data.length === 1) {
        return toLDJson(data[0], name);
    }

    return {
        "@context": "http://schema.org",
        "@type": "ReservationPackage",
        "subReservation": data.map((d) => toLDJson(d, name)),
    };
}

export async function toLDJson(data: any, name: string) {
    switch (data.$type) {
        case "Flight":
            return flightToLDJson(data, name);
        case "Hotel":
            return hotelToLDJson(data, name);
    }

    return undefined;
}
