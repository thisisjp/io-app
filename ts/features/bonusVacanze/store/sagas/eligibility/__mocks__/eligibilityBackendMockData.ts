import { Either, right } from "fp-ts/lib/Either";
import { Errors } from "io-ts";
import { pot } from "italia-ts-commons";
import { ProblemJson } from "italia-ts-commons/lib/responses";
import { InstanceId } from "../../../../../../../definitions/bonus_vacanze/InstanceId";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { mockedEligibilityCheck } from "../../../../mock/mockData";
import { navigateToEligible } from "../../../../navigation/action";
import {
  EligibilityRequestProgressEnum,
  EligibilityState
} from "../../../reducers/eligibility";
import { IExpectedActions } from "../../activation/__tests__/mockData";

// Common
export const genericServiceUnavailable: Either<Errors, any> = right({
  status: 500,
  value: {
    type: "https://example.com/problem/constraint-violation",
    title: "string",
    status: 500,
    detail: "There was an error processing the request",
    instance: "string"
  } as ProblemJson
});

export const commonTokenNullOrExpired: Either<Errors, any> = right({
  status: 401
});

export const commonNotFound: Either<Errors, any> = right({
  status: 404
});

// mock eligibility for /bonus/vacanze/eligibility POST

const startEligibilityRequestCreated: Either<Errors, any> = right({
  status: 201,
  value: { id: "bonus_id" } as InstanceId
});

export const startEligibilityProcessingRequest: Either<Errors, any> = right({
  status: 202
});

export const startEligibilityBonusAlreadyActive: Either<Errors, any> = right({
  status: 403
});

export const startEligibilityConflict: Either<Errors, any> = right({
  status: 409,
  value: {
    type: "https://example.com/problem/constraint-violation",
    title: "string",
    status: 409,
    detail: "There was an error processing the request",
    instance: "string"
  }
});

// mock eligibility for /bonus/vacanze/eligibility GET

const getEligibilitySuccess: Either<Errors, any> = right({
  status: 200,
  value: mockedEligibilityCheck
});

export const getEligibilityProcessRequest: Either<Errors, any> = right({
  status: 202
});

export type EligibilityBackendResponse = {
  startBonusEligibilityCheck: Either<Errors, any>;
  getBonusEligibilityCheck: Either<Errors, any>;
};

interface MockBackendEligibilityScenario extends IExpectedActions {
  responses: ReadonlyArray<EligibilityBackendResponse>;
  finalState: EligibilityState;
}

export const success: MockBackendEligibilityScenario = {
  displayName: "success",
  responses: [
    {
      startBonusEligibilityCheck: startEligibilityRequestCreated,
      getBonusEligibilityCheck: getEligibilitySuccess
    }
  ],
  expectedActions: [navigateToEligible(), navigationHistoryPop(1)],
  finalState: {
    checkRequest: {
      status: EligibilityRequestProgressEnum.ELIGIBLE,
      check: pot.toError(pot.none, new Error("response status 500"))
    }
  }
};

export const backendEligibilityIntegrationTestCases: ReadonlyArray<
  MockBackendEligibilityScenario
> = [success];
