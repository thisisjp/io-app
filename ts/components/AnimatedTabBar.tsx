import React from "react";
import { Animated, StyleSheet } from "react-native";

import I18n from "../i18n";
import { ScreenContentHeader } from "./screens/ScreenContentHeader";

type Props = {
  animation: any;
  renderTabBar: () => React.ReactFragment;
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "#fff"
  }
});

export default class AnimatedTabBar extends React.Component<Props> {
  public render() {
    const { animation, renderTabBar } = this.props;

    const transformWrapper = animation.getTransformWrapper(); // v slida in basso tutto l'headerone
    const transformSearchBar = animation.getTransformSearchBar(); // v slida in basso lo screencontentheader
    const opacitySearchBar = animation.getOpacitySearchBar();

    return (
      <Animated.View style={[styles.wrapper, transformWrapper]}>
        <Animated.View style={[opacitySearchBar, transformSearchBar]}>
          <ScreenContentHeader
            title={I18n.t("messages.contentTitle")}
            icon={require("./../../img/icons/message-icon.png")}
          />
        </Animated.View>
        {renderTabBar()}
      </Animated.View>
    );
  }
}
