import { connect as originalConnect, DispatchProp } from "react-redux";
import { combineReducers } from "redux";
import { IState as AuthState, reducer as AuthReducer } from "./auth";

export interface IStoreState {
    auth: AuthState;
}

export type Connected<K extends keyof IStoreState> = DispatchProp<IStoreState> & Partial<Pick<IStoreState, K>>;

const reducer = combineReducers<IStoreState>({
    auth: AuthReducer,
});

export { reducer };

export function connect<K extends keyof IStoreState, P extends Connected<K>>(
    component: React.ComponentClass<P>, ...keys: K[],
) {
    return originalConnect((state: IStoreState) => {
        const ret: Pick<IStoreState, K> = {} as any;
        for (const key of keys) {
            ret[key] = state[key];
        }

        return ret;
    })(component as any);
}
