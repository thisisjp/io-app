import { Text, View } from "native-base";
import * as React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { NavigationActions } from "react-navigation";
import { connect } from "react-redux";

import MessageListComponent from "../../components/messages/MessageListComponent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { FetchRequestActions } from "../../store/actions/constants";
import { loadMessages } from "../../store/actions/messages";
import { ReduxProps } from "../../store/actions/types";
import { orderedMessagesSelector } from "../../store/reducers/entities/messages";
import {
  servicesByIdSelector,
  ServicesByIdState
} from "../../store/reducers/entities/services/servicesById";
import { createLoadingSelector } from "../../store/reducers/loading";
import { GlobalState } from "../../store/reducers/types";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";

export type ReduxMappedProps = Readonly<{
  isLoadingMessages: boolean;
  messages: ReadonlyArray<MessageWithContentPO>;
  servicesById: ServicesByIdState;
}>;

export type Props = ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  emptyContentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export class MessageListScreen extends React.Component<Props, never> {
  private refreshMessageList = () => this.props.dispatch(loadMessages());

  private handleMessageListItemPress = (messageId: string) => {
    this.props.dispatch(
      NavigationActions.navigate({
        routeName: ROUTES.MESSAGE_DETAILS,
        params: {
          messageId
        }
      })
    );
  };

  public componentDidMount() {
    this.refreshMessageList();
  }

  public render() {
    const { isLoadingMessages, messages, servicesById } = this.props;

    return (
      <TopScreenComponent
        title={I18n.t("messages.contentTitle")}
        icon={require("../../../img/icons/message-icon.png")}
      >
        {/* Render empty state */}
        {messages.length === 0 && (
          <View style={styles.emptyContentContainer}>
            <Text>You have no message!</Text>
            {isLoadingMessages && (
              <ActivityIndicator size="large" color="#0000ff" />
            )}
          </View>
        )}

        {/* Render full state */}
        {messages.length > 0 && (
          <MessageListComponent
            messages={messages}
            servicesById={servicesById}
            refreshing={isLoadingMessages}
            onRefresh={this.refreshMessageList}
            onListItemPress={this.handleMessageListItemPress}
          />
        )}
      </TopScreenComponent>
    );
  }
}

const loadingMessagesSelector = createLoadingSelector([
  FetchRequestActions.MESSAGES_LOAD
]);

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isLoadingMessages: loadingMessagesSelector(state),
  messages: orderedMessagesSelector(state),
  servicesById: servicesByIdSelector(state)
});

export default connect(mapStateToProps)(MessageListScreen);
