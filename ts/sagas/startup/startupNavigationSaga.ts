import { put, select } from "redux-saga/effects";

import { navigateToDeepLink } from "../../store/actions/deepLink";
import { navigateToMainNavigatorAction } from "../../store/actions/navigation";
import { deepLinkSelector } from "../../store/reducers/deepLink";

export function* startupNavigationSaga() {
  const deepLink: ReturnType<typeof deepLinkSelector> = yield select(
    deepLinkSelector
  );

  if (deepLink) {
    // If a deep link has been set, navigate to deep link...
    yield put(navigateToDeepLink(deepLink));
  } else {
    // ... otherwise to the MainNavigator
    yield put(navigateToMainNavigatorAction());
  }
}
