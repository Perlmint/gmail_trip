import CLIENT_ID from "./clientId.txt";

export const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest",
    "https://people.googleapis.com/$discovery/rest?version=v1",
];
export const SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/contacts.readonly",
].join(" ");

export { CLIENT_ID };
