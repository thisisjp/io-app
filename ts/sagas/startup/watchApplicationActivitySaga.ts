import { Effect, Task } from "redux-saga";
import { call, cancel, fork, put, takeEvery } from "redux-saga/effects";

import { backgroundActivityTimeout } from "../../config";
import { startApplicationInitialization } from "../../store/actions/application";
import { APP_STATE_CHANGE_ACTION } from "../../store/actions/constants";
import {
  ApplicationState,
  ApplicationStateAction
} from "../../store/actions/types";
import { startTimer } from "../../utils/timer";

/**
 * Listen to APP_STATE_CHANGE_ACTION and if needed force the user to provide
 * the PIN
 */
// tslint:disable-next-line:cognitive-complexity
export function* watchApplicationActivitySaga(): IterableIterator<Effect> {
  // tslint:disable-next-line:no-let
  let bgTimer: Task | undefined;

  // tslint:disable-next-line:no-let
  let lastState: ApplicationState = "active";

  yield takeEvery(APP_STATE_CHANGE_ACTION, function*(
    action: ApplicationStateAction
  ) {
    // Listen for changes in application state
    const newApplicationState: ApplicationState = action.payload;

    if (lastState !== "background" && newApplicationState === "background") {
      // Start a background timer
      bgTimer = yield fork(backgroundTimer, backgroundActivityTimeout * 1000);
    } else if (lastState === "background" && newApplicationState === "active") {
      // Stop background timer
      if (bgTimer) {
        yield cancel(bgTimer);
        bgTimer = undefined;
      }
    }

    // Update the last state
    lastState = newApplicationState;
  });

  function* backgroundTimer(delay: number): IterableIterator<Effect> {
    console.log("Starting background timer");
    yield call(startTimer, delay);
    console.log("Sorry you need to insert the PIN again");
    yield put(startApplicationInitialization);
  }
}
