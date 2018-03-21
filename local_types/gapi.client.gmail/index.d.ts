
/// <reference path="../gapi.client/index.d.ts" />

declare namespace gapi.client.gmail.users {
    type UserId = string | "me";
    function getProfile(option: GetProfileOption): gapi.client.Request<Profile>;
    interface GetProfileOption {
        userId: UserId;
    }

    interface Profile {
        emailAddress: string;
        messagesTotal: number;
        threadsTotal: number;
        historyId: number;
    }

    namespace messages {
        function list(option: ListOption): gapi.client.Request<MessageList>;
        interface MessageList {
            messages: Message[];
            nextPageToken: string;
            resultSizeEstimate: number;
        }
        interface Message {
            id: string;
            threadId: string;
        }
        interface ListOption {
            userId: UserId;
            includeSpamTrash?: boolean;
            labelIds?: string[];
            maxResults?: number;
            pageToken?: string;
            q?: string;
        }

        function get(option: GetOptionDefault | GetOptionMetadata): gapi.client.Request<MessageDetail>;
        interface MessageDetail {
            id: string;
            threadId: string;
            labelIds: string[];
            snippet: string;
            historyId: string;
            internalDate: string;
            payload: {
                mimeType: string;
                headers: {
                    name: string;
                    value: string;
                }[];
            };
            sizeEstimate: number;
        }
        interface GetOptionDefault {
            id: string;
            userId: UserId;
            format?: "full" | "minimal" | "raw";
        }
        interface GetOptionMetadata {
            id: string;
            userId: UserId;
            format: "metadata";
            metadataHeaders: string[];
        }

        function send(option: SendOption): gapi.client.Request<any>;
        interface SendOption {
            userId: UserId;
            resource: {
                raw: string;
            };
        }
    }
}