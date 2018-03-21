// tslint:disable:object-literal-sort-keys
export function flightToLDJson(data: any) {
    return {
        "@context": "http://schema.org",
        "@type": "FlightReservation",
        "reservationId": data.reservationId,
        "reservationStatus": "http://schema.org/ReservationConfirmed",
        "reservationFor": {
          "@type": "Flight",
          "flightNumber": data.flightNumber,
          "provider": {
            "@type": "Airline",
            "iataCode": data.flightNumber.substring(0, 2),
          },
          "departureAirport": {
            "@type": "Airport",
            "iataCode": data.departureIATA,
          },
          "departureTime": data.departureTime,
          "arrivalAirport": {
            "@type": "Airport",
            "iataCode": data.arrivalIATA,
          },
          "arrivalTime": data.arrivalTime,
        },
    };
}

export function hotelToLDJson(data: any) {
    return {
        "@context": "http://schema.org",
        "@type": "LodgingReservation",
        "reservationId": data.reservationId,
        "reservationFor": {
          "@type": "LodgingBusiness",
          "name": data.name,
          "address": data.address,
          "telephone": data.telephone,
        },
        "checkinTime": data.checkIn.toISOString(),
        "checkoutTime": data.checkOut.toISOString(),
    };
}

export function packageToLDJson(data: any[]) {
    if (data.length === 1) {
        return toLDJson(data[0]);
    }

    return {
        "@context": "http://schema.org",
        "@type": "ReservationPackage",
        "subReservation": data.map(toLDJson),
    };
}

export function toLDJson(data: any) {
    switch (data.$type) {
        case "Flight":
            return flightToLDJson(data);
        case "Hotel":
            return hotelToLDJson(data);
    }

    return undefined;
}
