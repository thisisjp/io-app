/**
 * A saga to manage the load/refresh of visible services
 */
import { put, takeEvery } from "redux-saga/effects";
import { getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { metadataServicesByScopeLoad } from "../../store/actions/content";
import {
  loadServiceContent,
  loadVisibleServices
} from "../../store/actions/services";
import { loadServiceContentRequestHandler } from "./loadServiceContentRequestHandler";
import { loadVisibleServicesRequestHandler } from "./loadVisibleServicesHandler";

export function* watchServiceLoadSaga(
  backendClient: ReturnType<typeof BackendClient>
) {
  yield takeEvery(
    getType(loadServiceContent.request),
    loadServiceContentRequestHandler,
    backendClient.getService
  );

  yield takeEvery(
    getType(loadVisibleServices.request),
    loadVisibleServicesRequestHandler,
    backendClient.getVisibleServices
  );

  // Load/refresh services content
  yield put(loadVisibleServices.request());
  // Load/refresh refresh services scope list
  yield put(metadataServicesByScopeLoad.request());
}