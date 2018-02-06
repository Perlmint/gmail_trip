import { AnyAction } from "redux";

export interface IState {
    signedIn: boolean;
    ready: boolean;
}

export const Default: IState = {
    ready: false,
    signedIn: false,
};

const USER_SIGN_IN = "USER_SIGN_IN";
export function UserSignIn(isSignedIn: boolean) {
    return {
        type: USER_SIGN_IN,
        value: isSignedIn,
    };
}

const GAPI_AUTH_READY = "GAPI_AUTH_READY";
export function Ready() {
    return {
        type: GAPI_AUTH_READY,
    };
}

export function reducer(state: IState = Default, action: AnyAction) {
    switch (action.type) {
        case USER_SIGN_IN:
            state = Object.assign({}, state, {
                signedIn: action.value,
            });
            break;
        case GAPI_AUTH_READY:
            state = Object.assign({}, state, {
               ready: true,
            });
    }
    return state;
}
