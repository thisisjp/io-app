import { getType } from "typesafe-actions";

import { devicePreferencesSetUseBiometricIfAvailable } from "../../actions/devicePreferences";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type DevicePreferencesState = {
  useBiometricIfAvailable: boolean;
};

const INITIAL_STATE: DevicePreferencesState = {
  useBiometricIfAvailable: true
};

export default function devicePreferencesReducer(
  state: DevicePreferencesState = INITIAL_STATE,
  action: Action
): DevicePreferencesState {
  switch (action.type) {
    case getType(devicePreferencesSetUseBiometricIfAvailable):
      return {
        ...state,
        useBiometricIfAvailable: action.payload
      };

    default:
      return state;
  }
}

export const devicePreferencesSelector = (state: GlobalState) =>
  state.filesystem.devicePreferences;
