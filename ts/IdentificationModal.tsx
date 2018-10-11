import { Button, Content, Text } from "native-base";
import * as React from "react";
import { Modal, StatusBar } from "react-native";
import { connect } from "react-redux";

import BaseScreenComponent from "./components/screens/BaseScreenComponent";
import I18n from "./i18n";
import {
  identificationCancel,
  identificationFailure,
  identificationSuccess
} from "./store/actions/identification";
import { ReduxProps } from "./store/actions/types";
import { IdentificationState } from "./store/reducers/identification";
import { GlobalState } from "./store/reducers/types";
import { startPinReset } from "./store/actions/pinset";

type MapStateToProps = {
  identification: IdentificationState;
};

type Props = MapStateToProps & ReduxProps;

const contextualHelp = {
  title: I18n.t("pin_login.unlock_screen.help.title"),
  body: () => I18n.t("pin_login.unlock_screen.help.content")
};

const onRequestCloseHandler = () => undefined;

class IdentificationModal extends React.PureComponent<Props, never> {
  public render() {
    const { identification, dispatch } = this.props;

    if (identification.kind === "requested") {
      const {
        onIdentificationCancelAction,
        onIdentificationSuccessAction
      } = identification;
      const onIdentificationCancelHandler = () => {
        if (onIdentificationCancelAction) {
          dispatch(onIdentificationCancelAction);
        }
        dispatch(identificationCancel());
      };

      const onIdentificationSuccessHandler = () => {
        if (onIdentificationSuccessAction) {
          dispatch(onIdentificationSuccessAction);
        }
        dispatch(identificationSuccess());
      };

      const onIdentificationFailureHandler = () => {
        dispatch(identificationFailure());
      };

      const onPinResetHandler = () => {
        dispatch(startPinReset());
        dispatch(identificationCancel());
      };

      return (
        <Modal
          visible={true}
          transparent={true}
          onRequestClose={onRequestCloseHandler}
        >
          <BaseScreenComponent primary={true} contextualHelp={contextualHelp}>
            <StatusBar barStyle="light-content" />
            <Content primary={true}>
              <Button onPress={onIdentificationCancelHandler}>
                <Text>Cancel</Text>
              </Button>
              <Button onPress={onIdentificationSuccessHandler}>
                <Text>I am the REAL one!</Text>
              </Button>
              <Button onPress={onIdentificationFailureHandler}>
                <Text>No way!</Text>
              </Button>
              <Button onPress={onPinResetHandler}>
                <Text>Reset PIN!</Text>
              </Button>
            </Content>
          </BaseScreenComponent>
        </Modal>
      );
    }

    return null;
  }
}

const mapStateToProps = (state: GlobalState): MapStateToProps => ({
  identification: state.identification
});

export default connect(mapStateToProps)(IdentificationModal);
