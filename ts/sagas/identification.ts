import { Effect } from "redux-saga";
import { call, put, take, takeLatest } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import { startApplicationInitialization } from "../store/actions/application";
import { sessionInvalid } from "../store/actions/authentication";
import {
  identificationPinReset,
  identificationRequest,
  identificationReset,
  identificationStart,
  identificationSuccess
} from "../store/actions/identification";
import { PinString } from "../types/PinString";
import { deletePin } from "../utils/keychain";

export function* waitIdentificationResult(): IterableIterator<Effect> {
  const resultAction:
    | ActionType<typeof identificationSuccess>
    | ActionType<typeof identificationPinReset> = yield take([
    getType(identificationSuccess),
    getType(identificationPinReset)
  ]);

  if (resultAction.type === getType(identificationPinReset)) {
    // Delete the PIN
    yield call(deletePin);

    // Invalidate the session
    yield put(sessionInvalid());

    // Hide the identification screen
    yield put(identificationReset());

    return false;
  }

  return true;
}

// Start from saga
export function* startAndWaitIdentificationResult(pin: PinString) {
  yield put(identificationStart(pin));

  const result = yield call(waitIdentificationResult);
  return result;
}

// Started by redux action
export function* controlAndWaitIdentificationResult(
  pin: PinString
): IterableIterator<Effect> {
  yield put(identificationStart(pin));
  const identificationResult = yield call(waitIdentificationResult);

  if (!identificationResult) {
    yield put(startApplicationInitialization());
  }
}

export function* watchIdentificationRequest(
  pin: PinString
): IterableIterator<Effect> {
  yield takeLatest(
    getType(identificationRequest),
    controlAndWaitIdentificationResult,
    pin
  );
}
