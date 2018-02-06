import React from "react";
import { Button, Form, Grid, Header, Image, Segment } from "semantic-ui-react";
import { connect, Connected } from "./reducer/index";

interface IProps extends Connected<"auth"> {
}

class LoginForm extends React.Component<IProps> {
    public render() {
        return <Grid
            textAlign="center"
            style={{ height: "100%" }}
            verticalAlign="middle"
        >
            <Grid.Column style={{ maxWidth: 450 }}>
            <Header as="h2" color="teal" textAlign="center">
                <Image src="/logo.png" />
                {" "}Log-in to your account
            </Header>
            <Form size="large">
                <Segment stacked>
                <Button
                    color="teal" fluid size="large"
                    onClick={() => gapi.auth2.getAuthInstance().signIn()}>
                    Login with Google
                </Button>
                </Segment>
            </Form>
            </Grid.Column>
        </Grid>;
    }
}

export const ConnectedLoginForm = connect(LoginForm, "auth");
