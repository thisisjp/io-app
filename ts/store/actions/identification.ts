import { ActionType, createAction } from "typesafe-actions";

import { NavigationActions } from "./navigation";

export const identificationRequest = createAction(
  "IDENTIFICATION_REQUEST",
  resolve => (
    onIdentificationCancelAction?: NavigationActions,
    onIdentificationSuccessAction?: NavigationActions
  ) =>
    resolve({
      onIdentificationCancelAction,
      onIdentificationSuccessAction
    })
);

export const identificationCancel = createAction("IDENTIFICATION_CANCEL");
export const identificationSuccess = createAction("IDENTIFICATION_SUCCESS");
export const identificationFailure = createAction("IDENTIFICATION_FAILURE");
export const identificationReset = createAction("IDENTIFICATION_RESET");

export type IdentificationActions =
  | ActionType<typeof identificationRequest>
  | ActionType<typeof identificationCancel>
  | ActionType<typeof identificationSuccess>
  | ActionType<typeof identificationFailure>
  | ActionType<typeof identificationReset>;
