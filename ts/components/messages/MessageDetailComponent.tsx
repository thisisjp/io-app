import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import Markdown from "../ui/Markdown";
import MessageCTABar from "./MessageCTABar";

type OwnProps = {
  message: MessageWithContentPO;
  service?: ServicePublic;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  messageHeaderContainer: {
    padding: variables.contentPadding
  },

  messageDetailsLinkContainer: {
    flexDirection: "row"
  },

  messageCTAContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding
  },

  messageContentContainer: {
    padding: variables.contentPadding
  }
});

class MessageDetailComponent extends React.PureComponent<Props, never> {
  public render() {
    const { message, service } = this.props;

    return (
      <View>
        <View style={styles.messageHeaderContainer}>
          <H1>{message.content.subject}</H1>
        </View>

        <MessageCTABar
          message={message}
          service={service}
          containerStyle={styles.messageCTAContainer}
        />

        <View style={styles.messageContentContainer}>
          <Markdown lazy={true}>{message.content.markdown}</Markdown>
        </View>
      </View>
    );
  }
}

export default MessageDetailComponent;
