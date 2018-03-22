export async function findByIATA(iata: string) {
    const airports = (await import("../airports.csv")).default;

    return airports.find((airport) => airport.code === iata);
}

export async function search(text: string) {
    const airports = (await import("../airports.csv")).default;

    const re = new RegExp(text);

    return airports.filter((airport) => re.test(airport.code) || re.test(airport.name));
}
