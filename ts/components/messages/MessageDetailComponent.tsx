import { H1, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { Col, Grid } from "react-native-easy-grid";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import H4 from "../ui/H4";
import H6 from "../ui/H6";
import Markdown from "../ui/Markdown";
import MessageCTABar from "./MessageCTABar";
import MessageDetailRawInfoComponent from "./MessageDetailRawInfoComponent";

type OwnProps = {
  message: MessageWithContentPO;
  service?: ServicePublic;
  onServiceLinkPress?: () => void;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  headerContainer: {
    padding: variables.contentPadding
  },

  serviceContainer: {
    marginBottom: variables.contentPadding
  },

  subjectContainer: {
    marginBottom: variables.contentPadding
  },

  rawInfoContainer: {},

  ctaBarContainer: {
    backgroundColor: variables.contentAlternativeBackground,
    padding: variables.contentPadding,
    marginBottom: variables.contentPadding
  },

  markdownContainer: {
    paddingLeft: variables.contentPadding,
    paddingRight: variables.contentPadding
  }
});

class MessageDetailComponent extends React.PureComponent<Props, never> {
  public render() {
    const { message, service, onServiceLinkPress } = this.props;

    return (
      <View>
        <View style={styles.headerContainer}>
          {/* Service */}
          {service && (
            <Grid style={styles.serviceContainer}>
              <Col>
                <H4>{service.organization_name}</H4>
                <H6 link={true} onPress={onServiceLinkPress}>
                  {service.service_name}
                </H6>
              </Col>
            </Grid>
          )}

          {/* Subject */}
          <View style={styles.subjectContainer}>
            <H1>{message.content.subject}</H1>
          </View>

          {/* RawInfo */}
          <View style={styles.rawInfoContainer}>
            <MessageDetailRawInfoComponent
              message={message}
              service={service}
              onServiceLinkPress={onServiceLinkPress}
            />
          </View>
        </View>

        <MessageCTABar
          message={message}
          service={service}
          containerStyle={styles.ctaBarContainer}
        />

        <View style={styles.markdownContainer}>
          <Markdown lazy={true}>{message.content.markdown}</Markdown>
        </View>
      </View>
    );
  }
}

export default MessageDetailComponent;
