export async function findByIATA(iata: string) {
    const airlines = (await import("airlines.csv")).default;

    return airlines.find((airline) => airline.code === iata);
}

export async function search(text: string) {
    const airlines = (await import("airlines.csv")).default;

    const re = new RegExp(text);

    return airlines.filter((airline) => re.test(airline.code) || re.test(airline.name));
}
