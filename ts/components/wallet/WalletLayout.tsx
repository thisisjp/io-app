/**
 * Layout for the wallet section of the app.
 * This is comprised by a customizable header part
 * (with optionally a card displayed on the bottom
 * of this header), and a customized content on
 * the bottom part of the screen. Both are
 * wrapped in a ScrollView, and optionally a
 * footer with a button for starting a new payment
 */
import {
  Body,
  Button,
  Container,
  Content,
  Left,
  Right,
  Text,
  View
} from "native-base";
import * as React from "react";
import {
  Animated,
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";

import { NavigationEvents } from "react-navigation";
import I18n from "../../i18n";
import variables from "../../theme/variables";
import GoBackButton from "../GoBackButton";
import { InstabugButtons } from "../InstabugButtons";
import AppHeader from "../ui/AppHeader";
import IconFont from "../ui/IconFont";

const styles = StyleSheet.create({
  darkGrayBg: {
    backgroundColor: variables.brandDarkGray
  },

  noalias: {
    marginRight: 0
  },

  white: {
    color: variables.colorWhite
  },

  whiteBg: {
    backgroundColor: variables.colorWhite
  },

  noBottomPadding: {
    padding: variables.contentPadding,
    paddingBottom: 0
  },

  animatedSubHeader: {
    position: "absolute",
    top: 90, // header height TODO: get as variables if possible
    left: 0,
    right: 0,
    backgroundColor: variables.colorWhite,
    overflow: "hidden"
  },

  animatedSubHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: variables.contentPadding
  }
});

type Props = Readonly<{
  title: string;
  headerContents?: React.ReactNode;
  onNewPaymentPress?: () => void;
  allowGoBack: boolean;
  displayedWallets?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  isPagoPATestEnabled?: boolean;
  fixedSubHeader?: React.ReactNode;
  interpolationVars?: ReadonlyArray<number>;
}>;

type State = Readonly<{
  scrollY: Animated.Value;
}>;

const INITIAL_STATE = {
  scrollY: new Animated.Value(0)
};

export default class WalletLayout extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = INITIAL_STATE;
  }
  private WalletLayoutRef = React.createRef<ScrollView>();
  private scrollToTop = () => {
    if (this.WalletLayoutRef.current) {
      this.WalletLayoutRef.current.scrollTo({ x: 0, y: 0, animated: false });
    }
  };

  public render(): React.ReactNode {
    const { interpolationVars } = this.props;
    const subHeaderHeight =
      interpolationVars && interpolationVars.length === 3
        ? this.state.scrollY.interpolate({
            inputRange: [
              interpolationVars[1] - interpolationVars[2],
              interpolationVars[1] + interpolationVars[2]
            ],
            outputRange: [0, interpolationVars[0]],
            extrapolate: "clamp"
          })
        : 0;

    return (
      <Container>
        <AppHeader style={styles.darkGrayBg} noLeft={!this.props.allowGoBack}>
          {this.props.allowGoBack && (
            <Left>
              <GoBackButton white={true} style={styles.noalias} />
            </Left>
          )}
          <Body>
            {this.props.isPagoPATestEnabled ? (
              <Image
                style={{ resizeMode: "contain", width: 60 }}
                source={require("../../../img/wallet/logo-pagopa-test.png")}
              />
            ) : (
              <Image
                style={{ resizeMode: "contain", width: 40 }}
                source={require("../../../img/wallet/logo-pagopa.png")}
              />
            )}
          </Body>
          <Right>
            <InstabugButtons color={variables.colorWhite} />
          </Right>
        </AppHeader>

        <ScrollView
          bounces={false}
          style={
            this.props.contentStyle ? this.props.contentStyle : styles.whiteBg
          }
          ref={this.WalletLayoutRef}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            { nativeEvent: { contentOffset: { y: this.state.scrollY } } }
          ])}
        >
          <NavigationEvents onWillFocus={this.scrollToTop} />
          <Content
            scrollEnabled={false}
            style={[styles.darkGrayBg, styles.noBottomPadding]}
          >
            {this.props.headerContents}
            {this.props.displayedWallets}
          </Content>
          {this.props.children}
        </ScrollView>

        <Animated.View
          style={[styles.animatedSubHeader, { height: subHeaderHeight }]}
        >
          {this.props.fixedSubHeader}
        </Animated.View>

        {this.props.onNewPaymentPress && (
          <View footer={true}>
            <Button block={true} onPress={this.props.onNewPaymentPress}>
              <IconFont name="io-qr" style={{ color: variables.colorWhite }} />
              <Text>{I18n.t("wallet.payNotice")}</Text>
            </Button>
          </View>
        )}
      </Container>
    );
  }
}
