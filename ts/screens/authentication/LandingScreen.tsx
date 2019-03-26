/**
 * A screen where the user can choose to login with SPID or get more informations.
 * It includes a carousel with highlights on the app functionalities
 */
import { Button, Content, Switch, Text, View } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import { connect } from "react-redux";

import { DevScreenButton } from "../../components/DevScreenButton";
import { HorizontalScroll } from "../../components/HorizontalScroll";
import { LandingCardComponent } from "../../components/LandingCard";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import IconFont from "../../components/ui/IconFont";
import { isDevEnvironment } from "../../config";
import I18n from "../../i18n";
import ROUTES from "../../navigation/routes";
import { devicePreferencesSetUseBiometricIfAvailable } from "../../store/actions/devicePreferences";
import { ReduxProps } from "../../store/actions/types";
import { devicePreferencesSelector } from "../../store/reducers/filesystem/devicePreferences";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { ComponentProps } from "../../types/react";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = ReturnType<typeof mapStatetoProps> & ReduxProps & OwnProps;

const cardProps: ReadonlyArray<ComponentProps<typeof LandingCardComponent>> = [
  {
    id: 5,
    image: require("../../../img/landing/05.png"),
    title: I18n.t("authentication.landing.card5-title"),
    content: I18n.t("authentication.landing.card5-content")
  },
  {
    id: 1,
    image: require("../../../img/landing/01.png"),
    title: I18n.t("authentication.landing.card1-title"),
    content: I18n.t("authentication.landing.card1-content")
  },
  {
    id: 2,
    image: require("../../../img/landing/02.png"),
    title: I18n.t("authentication.landing.card2-title"),
    content: I18n.t("authentication.landing.card2-content")
  },
  {
    id: 3,
    image: require("../../../img/landing/03.png"),
    title: I18n.t("authentication.landing.card3-title"),
    content: I18n.t("authentication.landing.card3-content")
  },
  {
    id: 4,
    image: require("../../../img/landing/04.png"),
    title: I18n.t("authentication.landing.card4-title"),
    content: I18n.t("authentication.landing.card4-content")
  }
];

const LandingScreen: React.SFC<Props> = props => {
  const navigateToMarkdown = () => props.navigation.navigate(ROUTES.MARKDOWN);
  const navigateToIdpSelection = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_IDP_SELECTION);

  const navigateToSpidInformationRequest = () =>
    props.navigation.navigate(ROUTES.AUTHENTICATION_SPID_INFORMATION);

  const cardComponents = cardProps.map(p => (
    <LandingCardComponent key={`card-${p.id}`} {...p} />
  ));

  return (
    <BaseScreenComponent>
      {isDevEnvironment() && <DevScreenButton onPress={navigateToMarkdown} />}

      <Content contentContainerStyle={{ flex: 1 }} noPadded={true}>
        <View spacer={true} large={true} />
        <HorizontalScroll cards={cardComponents} />
        <View spacer={true} />
        <Text>Disable use biometric if available</Text>
        <Switch
          value={props.devicePreferences.useBiometricIfAvailable}
          onValueChange={() =>
            props.dispatch(
              devicePreferencesSetUseBiometricIfAvailable(
                !props.devicePreferences.useBiometricIfAvailable
              )
            )
          }
        />
      </Content>

      <View footer={true}>
        <Button
          block={true}
          primary={true}
          iconLeft={true}
          onPress={navigateToIdpSelection}
          testID="landing-button-login"
        >
          <IconFont name="io-profilo" color={variables.colorWhite} />
          <Text>{I18n.t("authentication.landing.login")}</Text>
        </Button>
        <View spacer={true} />
        <Button
          block={true}
          small={true}
          transparent={true}
          onPress={navigateToSpidInformationRequest}
        >
          <Text>{I18n.t("authentication.landing.nospid")}</Text>
        </Button>
      </View>
    </BaseScreenComponent>
  );
};

const mapStatetoProps = (state: GlobalState) => ({
  devicePreferences: devicePreferencesSelector(state)
});

export default connect(mapStatetoProps)(LandingScreen);
