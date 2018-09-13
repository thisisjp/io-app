import { Content, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { NavigationScreenProps } from "react-navigation";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import MessageDetailComponent from "../../components/messages/MessageDetailComponent";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import I18n from "../../i18n";
import { loadMessage } from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { messageByIdSelector } from "../../store/reducers/entities/messages/messagesById";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

type MessageDetailScreenNavigationParams = {
  messageId: string;
};

type OwnProps = NavigationScreenProps<MessageDetailScreenNavigationParams>;

type ReduxMapStateToProps = {
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

  errorStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export class MessageDetailScreen extends React.PureComponent<Props, never> {
  private goBack = () => this.props.navigation.goBack();

  private renderInvalidState = () => {
    return (
      <View style={styles.invalidStateContainer}>
        <Text>Sorry this screen was loaded with invalid parameters!</Text>
      </View>
    );
  };

  private renderFullContent = (
    message: MessageWithContentPO,
    service?: ServicePublic
  ) => {
    return <MessageDetailComponent message={message} service={service} />;
  };

  public componentDidMount() {
    const { messageId, message } = this.props;

    /**
     * If we haven't already the message in the store (ex. coming from a push notification or deep link)
     * try to load it.
     */
    if (messageId && !message) {
      this.props.dispatch(loadMessage(messageId));
    }
  }

  public render() {
    const { messageId, message, service } = this.props;

    return (
      <BaseScreenComponent
        headerTitle={I18n.t("messageDetails.headerTitle")}
        goBack={this.goBack}
      >
        <Content noPadded={true}>
          {/* Render invalid state */}
          {!messageId && this.renderInvalidState()}

          {/* Render full content */}
          {message && this.renderFullContent(message, service)}
        </Content>
      </BaseScreenComponent>
    );
  }
}

const mapStateToProps = (
  state: GlobalState,
  ownProps: OwnProps
): ReduxMapStateToProps => {
  const messageId = ownProps.navigation.getParam("messageId", "");

  if (messageId === "") {
    return {};
  }

  const message = messageByIdSelector(messageId)(state);

  const service = message
    ? serviceByIdSelector(message.sender_service_id)(state)
    : undefined;

  return {
    messageId,
    message,
    service
  };
};

export default connect(mapStateToProps)(MessageDetailScreen);
