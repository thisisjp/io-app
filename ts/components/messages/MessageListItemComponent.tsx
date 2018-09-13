import { Text, View } from "native-base";
import * as React from "react";
import {
  Platform,
  StyleSheet,
  TouchableNativeFeedback,
  TouchableWithoutFeedback
} from "react-native";
import { Col, Grid, Row } from "react-native-easy-grid";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import IconFont from "../ui/IconFont";
import MessageCTABar from "./MessageCTABar";

type OwnProps = {
  message: MessageWithContentPO;
  service?: ServicePublic;
  onItemPress?: (messageId: string) => void;
};

type Props = OwnProps;

const TouchableFeedbackComponent = Platform.select({
  ios: { Class: TouchableWithoutFeedback },
  android: { Class: TouchableNativeFeedback }
});

const styles = StyleSheet.create({
  itemContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  },

  grid: {
    borderBottomColor: variables.brandLightGray,
    borderBottomWidth: 1,
    paddingBottom: 16,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 23
  },

  iconContainer: {
    justifyContent: "flex-end",
    alignItems: "center",
    flexDirection: "row"
  },

  serviceText: {
    fontSize: variables.fontSize3
  },

  dateText: {
    color: variables.brandDarkGray,
    fontSize: variables.fontSize2
  },

  subjectRow: {
    paddingTop: 10
  }
});

export class MessageListItemComponent extends React.PureComponent<
  Props,
  never
> {
  public render() {
    const { message, service, onItemPress } = this.props;

    const onItemPressHandler = onItemPress
      ? () => onItemPress(message.id)
      : undefined;

    return (
      <TouchableFeedbackComponent.Class
        key={message.id}
        onPress={onItemPressHandler}
      >
        <View style={styles.itemContainer}>
          <Grid style={styles.grid}>
            <Row>
              <Col>
                <Text
                  style={styles.serviceText}
                  leftAlign={true}
                  alternativeBold={true}
                >
                  Comune di Milano - Servizio tributi
                </Text>
              </Col>
              <Col>
                <Text style={styles.dateText} rightAlign={true}>
                  10:15
                </Text>
              </Col>
            </Row>
            <Row style={styles.subjectRow}>
              <Col size={11}>
                <Text leftAlign={true}>{message.content.subject}</Text>
              </Col>
              <Col size={1} style={styles.iconContainer}>
                <IconFont
                  name="io-right"
                  size={24}
                  color={variables.contentPrimaryBackground}
                />
              </Col>
            </Row>
            <Row>
              <MessageCTABar message={message} service={service} />
            </Row>
          </Grid>
        </View>
      </TouchableFeedbackComponent.Class>
    );
  }
}

export default MessageListItemComponent;
