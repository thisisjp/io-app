import { Button, Content, Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import MessageDetailComponent from "../../components/messages/MessageDetailComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { FetchRequestActions } from "../../store/actions/constants";
import {
  loadMessage,
  loadMessageAndServiceAction
} from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { messageByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { createErrorSelector } from "../../store/reducers/error";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

const NO_MESSAGE_ID_PARAM = "NO_MESSAGE_ID_PARAM";

type MessageDetailScreenNavigationParams = {
  messageId: string;
};

type OwnProps = NavigationScreenProps<MessageDetailScreenNavigationParams>;

type ReduxMapStateToProps = {
  isLoading: boolean;
  hasError: boolean;
  messageId?: string;
  message?: MessageWithContentPO;
  service?: ServicePublic;
};

type Props = OwnProps & ReduxMapStateToProps & ReduxProps;

const styles = StyleSheet.create({
  invalidStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  loadingStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  errorStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export class MessageDetailScreen extends React.PureComponent<Props, never> {
  private goBack = () => this.props.navigation.goBack();

  private onServiceLinkPressHandler = () => {
    const service = this.props.service;
    if (service) {
      this.props.navigation.navigate(ROUTES.PREFERENCES_SERVICE_DETAIL, {
        service
      });
    }
  };

  /**
   * Used when something went wrong and there is no way to recover.
   * (ex. no messageId navigation parameter passed to the screen)
   */
  private renderInvalidState = () => {
    return (
      <View style={styles.invalidStateContainer}>
        <Text>Sorry this screen was loaded with invalid parameters!</Text>
      </View>
    );
  };

  /**
   * Used when the App is trying to load the message/service.
   */
  private renderLoadingState = () => {
    return (
      <View style={styles.loadingStateContainer}>
        <Text>Trying to load the message details...</Text>
        <ActivityIndicator />
      </View>
    );
  };

  /**
   * Used when something went wrong but there is a way to recover.
   * (ex. the loading of the message/service failed but we can retry)
   */
  private renderErrorState = (messageId: string) => {
    return (
      <View style={styles.loadingStateContainer}>
        <Text>An error occurred while loading the message details.</Text>
        <Button
          primary={true}
          onPress={() =>
            this.props.dispatch(loadMessageAndServiceAction(messageId))
          }
        >
          <Text>Retry</Text>
        </Button>
      </View>
    );
  };

  /**
   * Used when we have all data to properly render the content of the screen.
   */
  private renderFullState = (
    message: MessageWithContentPO,
    service?: ServicePublic
  ) => {
    return (
      <Content noPadded={true}>
        <MessageDetailComponent
          message={message}
          service={service}
          onServiceLinkPress={this.onServiceLinkPressHandler}
        />
      </Content>
    );
  };

  private renderCurrentState = () => {
    const { isLoading, hasError, messageId, message, service } = this.props;

    if (!messageId) {
      return this.renderInvalidState();
    } else if (isLoading) {
      return this.renderLoadingState();
    } else if (hasError) {
      return this.renderErrorState(messageId);
    } else if (message) {
      return this.renderFullState(message, service);
    }

    // Fallback to invalid state
    return this.renderInvalidState();
  };

  public componentDidMount() {
    const { messageId, message } = this.props;

    /**
     * If the message in not in the store (ex. coming from a push notification or deep link)
     * try to load it.
     */
    if (messageId && !message) {
      this.props.dispatch(loadMessageAndServiceAction(messageId));
    }
  }

  public render() {
    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={this.goBack}
      >
        {this.renderCurrentState()}
      </BaseScreenComponent>
    );
  }
}

const messageAdnServiceLoadLoadingSelector = createLoadingSelector([
  FetchRequestActions.MESSAGE_AND_SERVICE_LOAD
]);

const messageAndServiceLoadErrorSelector = createErrorSelector([
  FetchRequestActions.MESSAGE_AND_SERVICE_LOAD
]);

const mapStateToProps = (
  state: GlobalState,
  ownProps: OwnProps
): ReduxMapStateToProps => {
  const isLoading = messageAdnServiceLoadLoadingSelector(state);

  const hasError = messageAndServiceLoadErrorSelector(state).isSome();

  const messageId = ownProps.navigation.getParam(
    "messageId",
    NO_MESSAGE_ID_PARAM
  );

  if (messageId === NO_MESSAGE_ID_PARAM) {
    return {
      isLoading,
      hasError
    };
  }

  const message = messageByIdSelector(messageId)(state);

  const service = message
    ? serviceByIdSelector(message.sender_service_id)(state)
    : undefined;

  return {
    isLoading,
    hasError,
    messageId,
    message,
    service
  };
};

export default connect(mapStateToProps)(MessageDetailScreen);
