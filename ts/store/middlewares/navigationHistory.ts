import { none, Option, some } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { Toast } from "native-base";
import { BackHandler } from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import { Middleware } from "redux";
import I18n from "../../i18n";
import { navigationRestore } from "../actions/navigation";
import {
  navigationHistoryPop,
  navigationHistoryPush,
  navigationHistoryReset
} from "../actions/navigationHistory";
import { Action, Dispatch, MiddlewareAPI } from "../actions/types";
import { GlobalState } from "../reducers/types";

/**
 * if the user presses back button twice in a time window of exitConfirmThreshold milliseconds
 * then app will be closed
 */
const exitConfirmThreshold = 2000 as Millisecond;

/**
 * exitApp will be called if user press twice back when
 * navigation history is empty. Remember BackHandler.exitApp() works
 * on Android platforms (and others) but not on iOS platforms
 */
const exitApp = () => BackHandler.exitApp();

// tslint:disable-next-line:cognitive-complexity
export function createNavigationHistoryMiddleware(): Middleware<
  Dispatch,
  GlobalState
> {
  // tslint:disable-next-line:no-let
  let firstRun = true;
  // tslint:disable-next-line:no-let
  let lastExitRequestTime: Option<Millisecond> = none;

  return (store: MiddlewareAPI) => (next: Dispatch) => (action: Action) => {
    switch (action.type) {
      case NavigationActions.INIT:
      case NavigationActions.NAVIGATE:
      case NavigationActions.SET_PARAMS:
      case StackActions.REPLACE:
      case StackActions.POP_TO_TOP: {
        // We don't need to store the history on first navigation
        if (firstRun) {
          firstRun = false;
          return next(action);
        }

        // Get the state before the react-navigation reducer
        const oldNavigationState = store.getState().nav;
        // Dispatch the original action
        const nextAction = next(action);
        // Get the state after the react-navigation reducer
        const newNavigationState = store.getState().nav;
        // If the old state is different from the new state
        if (newNavigationState !== oldNavigationState) {
          // Dispatch an action to push the old state into the navigation history
          store.dispatch(navigationHistoryPush(oldNavigationState));
        }
        return nextAction;
      }

      case StackActions.RESET: {
        // If the RESET is the first navigation action we need to set first run to false
        if (firstRun) {
          firstRun = false;
        }

        /**
         * Dispatch an action to reset the history.
         */
        store.dispatch(navigationHistoryReset());
        return next(action);
      }

      case NavigationActions.BACK: {
        // Get the current navigation history
        const currentNavigationHistory = store.getState().navigationHistory;
        // If the history is empty ask to user to press back again or
        // check if we have to close the app
        if (currentNavigationHistory.length === 0) {
          const now = new Date().getTime() as Millisecond;
          const elaspedTime =
            now - lastExitRequestTime.getOrElse(0 as Millisecond);
          // close previous toast showing before close the app or show a new toast
          Toast.hide();
          if (
            lastExitRequestTime.isSome() &&
            elaspedTime < exitConfirmThreshold
          ) {
            lastExitRequestTime = none;
            exitApp();
          } else {
            Toast.show({ text: I18n.t("exit.pressAgain") });
          }
          lastExitRequestTime = some(now);
          return;
        }
        lastExitRequestTime = none;

        // Get the previous navigation state
        const previousNavigationState = {
          ...currentNavigationHistory[currentNavigationHistory.length - 1]
        };

        // Pop the last element from the history
        store.dispatch(navigationHistoryPop());
        // Dispatch an action to restore the previous state
        store.dispatch(navigationRestore(previousNavigationState));
      }

      default:
        return next(action);
    }
  };
}
