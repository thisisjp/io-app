import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

import { GetMessageT, GetServiceT } from "../../api/backend";
import I18n from "../../i18n";
import { MESSAGE_AND_SERVICE_LOAD_REQUEST } from "../../store/actions/constants";
import {
  loadMessageAndServiceFailureAction,
  loadMessageAndServiceSuccessAction,
  MessageAndServiceLoadRequest
} from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { loadMessage, loadService } from "./watchLoadMessagesSaga";

export function* loadMessageAndServiceSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>,
  messageAndServiceLoadRequest: MessageAndServiceLoadRequest
): IterableIterator<Effect> {
  const messageId = messageAndServiceLoadRequest.payload;

  const messageOrError: SagaCallReturnType<typeof loadMessage> = yield call(
    loadMessage,
    getMessage,
    messageId
  );

  if (!(messageOrError instanceof Error)) {
    const serviceOrError = yield call(
      loadService,
      getService,
      messageOrError.sender_service_id
    );

    if (!(serviceOrError instanceof Error)) {
      yield put(loadMessageAndServiceSuccessAction());

      return;
    }
  }

  yield put(
    loadMessageAndServiceFailureAction(
      new Error(I18n.t("global.actions.retry"))
    )
  );
}

export function* watchLoadMessageAndServiceSaga(
  getMessage: TypeofApiCall<GetMessageT>,
  getService: TypeofApiCall<GetServiceT>
) {
  yield takeEvery(
    MESSAGE_AND_SERVICE_LOAD_REQUEST,
    loadMessageAndServiceSaga,
    getMessage,
    getService
  );
}
