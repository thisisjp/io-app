import { Effect } from "redux-saga";
import { put, take } from "redux-saga/effects";
import { ActionType, getType } from "typesafe-actions";

import {
  identificationCancel,
  identificationRequest,
  identificationSuccess
} from "../store/actions/identification";

export function* waitForIdentification(): IterableIterator<Effect> {
  yield put(identificationRequest());
  const resultAction:
    | ActionType<typeof identificationSuccess>
    | ActionType<typeof identificationCancel> = yield take([
    getType(identificationSuccess),
    getType(identificationCancel)
  ]);

  switch (resultAction.type) {
    case getType(identificationSuccess):
      return true;
    default:
      return false;
  }
}
