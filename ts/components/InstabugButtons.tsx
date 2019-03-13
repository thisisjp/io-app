import Instabug, { invocationMode } from "instabug-reactnative";
import * as React from "react";
import { StyleSheet, TouchableHighlight } from "react-native";
import { Button } from "native-base";
import { connect } from "react-redux";

import { GlobalState } from "../store/reducers/types";
import IconFont from "./ui/IconFont";

const styles = StyleSheet.create({
  button: {
    paddingLeft: 10,
    paddingRight: 10
  }
});

interface OwnProps {
  color?: string;
}

type Props = ReturnType<typeof mapStateToProps> & OwnProps;

class InstabugButtonsComponent extends React.PureComponent<Props, {}> {
  private handleIBChatPress() {
    Instabug.invokeWithInvocationMode(invocationMode.chatsList);
  }

  private handleIBBugPress() {
    Instabug.invokeWithInvocationMode(invocationMode.newBug);
  }

  public render() {
    return (
      this.props.isDebugModeEnabled && (
        <React.Fragment>
          <Button transparent={true} onPress={this.handleIBChatPress}>
            <IconFont name="io-chat" color={this.props.color} />
          </Button>
          <Button transparent={true} onPress={this.handleIBBugPress}>
            <IconFont name="io-bug" color={this.props.color} />
          </Button>
        </React.Fragment>
      )
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  isDebugModeEnabled: state.debug.isDebugModeEnabled
});

export const InstabugButtons = connect(mapStateToProps)(
  InstabugButtonsComponent
);
