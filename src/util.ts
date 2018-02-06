import update, { Query } from "immutability-helper";
import React from "react";

export function updateState<P, S>(self: React.Component<P, S>, spec: Query<S>) {
    return new Promise<void>((resolve) =>
        self.setState((state) => update(state, spec), resolve),
    );
}
