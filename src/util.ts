import update, { Query } from "immutability-helper";
import React from "react";

export function updateState<P, S>(self: React.Component<P, S>, spec: Query<S>) {
    return new Promise<void>((resolve) =>
        self.setState((state) => update(state, spec), resolve),
    );
}

export function b64EncodeUnicode(str: string) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(__, p1: string) {
            return String.fromCharCode(parseInt(p1, 16));
    }));
}

export function quotedPrintable(str: string) {
    return encodeURIComponent(str).replace(/%/g, "=");
}

export function webSafeBase64(str: string) {
    return str.replace(/\+/g, "-").replace(/\//g, "_");
}
