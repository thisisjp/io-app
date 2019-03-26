import { ActionType, createStandardAction } from "typesafe-actions";

export const devicePreferencesSetUseBiometricIfAvailable = createStandardAction(
  "DEVICE_PREFERENCES_SET_USE_BIOMETRIC_IF_AVAILABLE"
)<boolean>();

export type DevicePreferencesActions = ActionType<
  typeof devicePreferencesSetUseBiometricIfAvailable
>;
