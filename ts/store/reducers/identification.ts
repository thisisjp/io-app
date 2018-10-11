import { getType } from "typesafe-actions";

import {
  identificationCancel,
  identificationRequest,
  identificationSuccess
} from "../actions/identification";
import { NavigationActions } from "../actions/navigation";
import { Action } from "../actions/types";

type IdentificationUnidentifiedState = {
  kind: "unidentified";
};

type IdentificationRequestedState = {
  kind: "requested";
  onIdentificationCancelAction?: NavigationActions;
  onIdentificationSuccessAction?: NavigationActions;
};

type IdentificationIdentifiedState = {
  kind: "identified";
};

export type IdentificationState =
  | IdentificationUnidentifiedState
  | IdentificationRequestedState
  | IdentificationIdentifiedState;

export const INITIAL_STATE: IdentificationUnidentifiedState = {
  kind: "unidentified"
};

const reducer = (
  state: IdentificationState = INITIAL_STATE,
  action: Action
): IdentificationState => {
  switch (action.type) {
    case getType(identificationRequest):
      return {
        kind: "requested",
        ...action.payload
      };

    case getType(identificationCancel):
      return {
        kind: "unidentified"
      };

    case getType(identificationSuccess):
      return {
        kind: "identified"
      };

    default:
      return state;
  }
};

export default reducer;
