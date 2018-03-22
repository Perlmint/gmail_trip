import "bluebird-global";
import update from "immutability-helper";
import PropTypes from "prop-types";
import React, { ReactElement } from "react";
import ReactDOM from "react-dom";
import Loadable from "react-loadable";
import { Provider } from "react-redux";
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid";
import Loader from "semantic-ui-react/dist/commonjs/elements/Loader";
import Segment from "semantic-ui-react/dist/commonjs/elements/Segment";
import Dimmer from "semantic-ui-react/dist/commonjs/modules/Dimmer";
import { CLIENT_ID, DISCOVERY_DOCS, SCOPES } from "./const";
import { ConnectedLoginForm } from "./login";
import { packageToLDJson } from "./meta/ld_json";
import { IMetaData } from "./meta/type";
import { connect, Connected } from "./reducer";
import { Ready, UserSignIn } from "./reducer/auth";
import { IStepInfo, Steps } from "./steps";
import store from "./store";

Promise.config({
    cancellation: true,
});

window.addEventListener("load", function init() {
    gapi.load("client:auth2", () => {
        gapi.client.init({
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        }).then(() => {
            store.dispatch(Ready());
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
    });
    window.removeEventListener("load", init);
});

function updateSigninStatus(isSignedIn: boolean) {
    store.dispatch(UserSignIn(isSignedIn));
}

interface IStepRenderInfo extends IStepInfo {
    render(): ReactElement<any>;
}

const MetaEditorLoadable = Loadable({
    loader() {
        return import("./meta");
    },
    loading() {
        return <Loader />;
    },
});

const MailEditorLoadable = Loadable({
    loader() {
        return import("./mail");
    },
    loading() {
        return <Loader />;
    },
});

const steps: IStepRenderInfo[] = [{
    description: "Fill reservation info",
    icon: "edit",
    render() { return <MetaEditorLoadable />; },
    title: "Fill info",
}, {
    description: "Write mail contents manually or select mail to forward",
    icon: "mail outline",
    render() { return <MailEditorLoadable />; },
    title: "Mail contents",
}, {
    icon: "send",
    render() { return <span></span>; },
    title: "Send",
}];

interface IProps extends Connected<"auth"> {
}

interface IStates {
    step: number;
    metadata: IMetaData[];
}

class Index extends React.Component<IProps, IStates> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            metadata: [],
            step: 0,
        };
    }

    public static childContextTypes = {
        getMetaData: PropTypes.func,
        setMetaData: PropTypes.func,
    };

    public getChildContext() {
        return {
            getMetaData: this.getMetaData.bind(this),
            setMetaData: this.setMetaData.bind(this),
        };
    }

    protected setMetaData(metaData: IMetaData[]) {
        this.setState((state) => update(state, {
            metadata: {
                $set: metaData,
            },
            step: {
                $set: 1,
            },
        }));
    }

    protected async getMetaData() {
        return packageToLDJson(
            this.state.metadata.map((m) => m.data),
            gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile().getName()
        );
    }

    protected renderLoading() {
        return  <Grid
                textAlign="center"
                style={{ height: "100%" }}
                verticalAlign="middle"
            >
            <Grid.Column style={{ maxWidth: 450 }}>
                <Dimmer active inverted>
                    <Loader inverted>Loading</Loader>
                </Dimmer>
            </Grid.Column>
        </Grid>;
    }

    public render() {
        if (!(this.props.auth!.ready)) {
            return this.renderLoading();
        }
        if (!this.props.auth!.signedIn) {
            return <ConnectedLoginForm />;
        } else {
            return <Grid
                textAlign="center"
                style={{ height: "100%" }}
                verticalAlign="middle"
            >
                <Grid.Column style={{ width: "90%" }}>
                    <Steps step={this.state.step} steps={steps} attached="top"/>
                    <Segment attached>
                        { steps[this.state.step].render() }
                    </Segment>
                </Grid.Column>
            </Grid>;
        }
    }
}

const ConnectedIndex = connect(Index, "auth");

ReactDOM.render(<Provider store={store}><ConnectedIndex /></Provider>, document.getElementById("app"));
