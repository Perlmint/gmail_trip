
/// <reference path="../gapi.client/index.d.ts" />

declare namespace gapi.client.gmail.users.messages {
    type UserId = string | "me";
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
}