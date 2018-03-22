declare module "*.txt" {
    const value: string;
    export = value;
}

declare namespace Airline {
    interface Data {
        name: string;
        code: string;
    }
}

declare namespace Airport {
    export interface Data {
        name: string;
        code: string;
        timezone: string;
    }
}