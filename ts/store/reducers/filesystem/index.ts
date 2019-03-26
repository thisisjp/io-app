import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import { Action } from "../../actions/types";
import devicePreferencesReducer, {
  DevicePreferencesState
} from "./devicePreferences";

export type FilesystemState = Readonly<{
  devicePreferences: DevicePreferencesState;
}>;

// Here we mix the plain FilesystemState with the keys added by redux-persist
export type PersistedFilesystemState = FilesystemState & PersistPartial;

const filesystemReducer = combineReducers<FilesystemState, Action>({
  devicePreferences: devicePreferencesReducer
});

export default filesystemReducer;
