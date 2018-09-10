import { createSwitchNavigator } from "react-navigation";

import BackgroundScreen from "../screens/BackgroundScreen";
import IngressScreen from "../screens/IngressScreen";
import AuthenticationNavigator from "./AuthenticationNavigator";
import MainNavigator from "./MainNavigator";
import OnboardingNavigator from "./OnboardingNavigator";
import PinNavigator from "./PinNavigator";
import ROUTES from "./routes";

/**
 * The main stack of screens of the Application.
 */
const navigator = createSwitchNavigator({
  [ROUTES.INGRESS]: {
    // This is the first screen that gets loaded by the app navigator
    // On component mount, the screen will dispatch an
    // APPLICATION_INITIALIZED action that gets handled by the startup saga.
    screen: IngressScreen
  },
  [ROUTES.BACKGROUND]: {
    screen: BackgroundScreen
  },
  [ROUTES.AUTHENTICATION]: {
    // The navigator used for unauthenticated users
    screen: AuthenticationNavigator
  },
  [ROUTES.ONBOARDING]: {
    screen: OnboardingNavigator
  },
  [ROUTES.PIN_LOGIN_NAVIGATOR]: {
    screen: PinNavigator
  },
  [ROUTES.MAIN]: {
    // The navigator used for authenticated users
    screen: MainNavigator
  }
});

export default navigator;
