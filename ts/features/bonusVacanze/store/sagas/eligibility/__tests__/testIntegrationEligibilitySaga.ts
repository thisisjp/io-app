import { Either, right } from "fp-ts/lib/Either";
import { fromNullable, some } from "fp-ts/lib/Option";
import { Errors } from "io-ts";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { select } from "redux-saga-test-plan/matchers";
import { navigateToWalletHome } from "../../../../../../store/actions/navigation";
import { navigationHistoryPop } from "../../../../../../store/actions/navigationHistory";
import { navigationCurrentRouteSelector } from "../../../../../../store/reducers/navigation";
import BONUSVACANZE_ROUTES from "../../../../navigation/routes";
import {
  activateBonusVacanze,
  cancelBonusVacanzeRequest
} from "../../../actions/bonusVacanze";
import eligibilityReducer, {
  EligibilityRequestProgressEnum,
  EligibilityState
} from "../../../reducers/eligibility";
import {
  backendEligibilityIntegrationTestCases,
  EligibilityBackendResponse
} from "../__mocks__/eligibilityBackendMockData";
import { bonusEligibilitySaga } from "../getBonusEligibilitySaga";
import { handleBonusEligibilitySaga } from "../handleBonusEligibilitySaga";

jest.mock("react-native-background-timer", () => {
  return {
    startTimer: jest.fn()
  };
});

jest.mock("react-native-share", () => {
  return {
    open: jest.fn()
  };
});

const getDisplayNameBackendResponse = (value: Either<Errors, any>): string => {
  return value.fold(
    _ => {
      return "Left error";
    },
    r => {
      return r ? (r.status as string) : "undefined";
    }
  );
};

describe("Bonus Eligibility Saga Integration Test", () => {
  it("Cancel A bonus request after server error", () => {
    const startBonusEligibilityCheck = jest.fn();
    const getBonusEligibilityCheck = jest.fn();

    return expectSaga(
      handleBonusEligibilitySaga,
      bonusEligibilitySaga(startBonusEligibilityCheck, getBonusEligibilityCheck)
    )
      .withReducer(eligibilityReducer)
      .provide([
        [
          select(navigationCurrentRouteSelector),
          some(BONUSVACANZE_ROUTES.ELIGIBILITY.LOADING)
        ],
        [
          matchers.call.fn(startBonusEligibilityCheck),
          right({ status: 500, value: {} })
        ]
      ])
      .dispatch(cancelBonusVacanzeRequest())
      .put(navigationHistoryPop(1))
      .put(navigateToWalletHome())
      .hasFinalState({
        checkRequest: {
          status: EligibilityRequestProgressEnum.ERROR,
          check: pot.toError(pot.none, new Error("response status 500"))
        }
      })
      .run();
  });
  backendEligibilityIntegrationTestCases.map(testCase =>
    testCase.responses.map(response => {
      return it(`${
        testCase.displayName
      }, startBonusEligibilityCheck[${getDisplayNameBackendResponse(
        response.startBonusEligibilityCheck
      )}] with getBonusEligibilityCheck[${getDisplayNameBackendResponse(
        response.getBonusEligibilityCheck
      )}]`, () =>
        expectSagaFactory(
          response,
          testCase.expectedActions,
          testCase.finalState
        ));
    })
  );
});

const expectSagaFactory = (
  backendResponses: EligibilityBackendResponse,
  actionToVerify: ReadonlyArray<Action>,
  finalState: EligibilityState
) => {
  const startBonusEligibility = jest.fn();
  const getBonusEligibility = jest.fn();
  const baseSaga = expectSaga(
    handleBonusEligibilitySaga,
    bonusEligibilitySaga(startBonusEligibility, getBonusEligibility)
  )
    .provide([
      [
        select(navigationCurrentRouteSelector),
        fromNullable(BONUSVACANZE_ROUTES.ELIGIBILITY.LOADING)
      ],
      [
        matchers.call.fn(startBonusEligibility),
        backendResponses.startBonusEligibilityCheck
      ],
      [
        matchers.call.fn(getBonusEligibility),
        backendResponses.getBonusEligibilityCheck
      ]
    ])
    .withReducer(eligibilityReducer);
  return (
    actionToVerify
      .reduce((acc, val) => acc.put(val), baseSaga)
      // when the last event completeBonusVacanze is received, the navigation stack is popped
      .dispatch(activateBonusVacanze.request())
      .hasFinalState(finalState)
      .run()
      .then(results => {
        expect(results.effects.select.length).toEqual(1);
        // in this phase the put in the store is not tested, at the end I should have only one put action left
        expect(results.effects.put.length).toEqual(1);
      })
  );
};
