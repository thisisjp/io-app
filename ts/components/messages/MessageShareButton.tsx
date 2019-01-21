import { Fab, Icon, View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import Share from "react-native-share";

import variables from "../../theme/variables";

type Props = {
  title: string;
  content: string;
};

type State = {
  active: boolean;
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: variables.brandPrimary,
    opacity: 0.75
  }
});

class MessageShareButton extends React.PureComponent<Props, State> {
  public state = {
    active: false
  };

  public render() {
    const { active } = this.state;

    return (
      <View>
        <Fab
          active={active}
          onPress={this.handleOnPress}
          position="bottomRight"
          direction={"up"}
          style={styles.fab}
        >
          <Icon name="share" />
        </Fab>
      </View>
    );
  }
  private handleOnPress = () => {
    Share.open({
      url: "https://io.italia.it/",
      title: "I am the title",
      message: "I am the message and i have very very long. Thanks for sharing!"
    }).then(_ => 0, __ => 0);
  };
}

export default MessageShareButton;
