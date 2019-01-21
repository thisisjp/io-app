import { Button, Fab, Icon, View } from "native-base";
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
    backgroundColor: variables.brandPrimary
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
          onPress={this.handleFabPress}
          position="bottomRight"
          direction={"up"}
          style={styles.fab}
        >
          <Icon name="share" />
          <Button onPress={this.handleFabEmail}>
            <Icon name="mail" />
          </Button>
        </Fab>
      </View>
    );
  }
  private handleFabPress = () => {
    this.setState(prevState => ({
      active: !prevState.active
    }));
  };

  // TODO: Render the HTML
  private handleFabEmail = () => {
    Share.shareSingle({
      url: "https://io.italia.it/",
      title: "I am the title",
      subject: "I am the subject",
      message:
        "I am the message and i have very very long. Thanks for sharing!",
      type: "text/html",
      social: "email"
    }).then(_ => 0, _ => 0);
  };
}

export default MessageShareButton;
