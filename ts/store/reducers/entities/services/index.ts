/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";

import { createSelector } from "reselect";
import { isDefined } from "../../../../utils/guards";
import { Action } from "../../../actions/types";
import { servicesMetadataSelector } from "../../content";
import { GlobalState } from "../../types";
import { organizationNamesByFiscalCodeSelector } from "../organizations/organizationsByFiscalCodeReducer";
import readStateByServiceReducer, {
  ReadStateByServicesId
} from "./readStateByServiceId";
import servicesByIdReducer, { ServicesByIdState } from "./servicesById";
import {
  serviceIdsByOrganizationFiscalCodeReducer,
  ServiceIdsByOrganizationFiscalCodeState
} from "./servicesByOrganizationFiscalCode";
import {
  visibleServicesReducer,
  VisibleServicesState
} from "./visibleServices";

export type ServicesState = Readonly<{
  byId: ServicesByIdState;
  byOrgFiscalCode: ServiceIdsByOrganizationFiscalCodeState;
  visible: VisibleServicesState;
  readState: ReadStateByServicesId;
}>;

const reducer = combineReducers<ServicesState, Action>({
  byId: servicesByIdReducer,
  byOrgFiscalCode: serviceIdsByOrganizationFiscalCodeReducer,
  visible: visibleServicesReducer,
  readState: readStateByServiceReducer
});

export default reducer;

// Selectors
export const servicesSelector = (state: GlobalState) => state.entities.services;

export const serviceSectionsSelector = createSelector(
  [servicesSelector, organizationNamesByFiscalCodeSelector],
  (services, organizations) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const organizationName = organizations[fiscalCode] || fiscalCode;
        const organizationFiscalCode = fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined);
        return {
          organizationName,
          organizationFiscalCode,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) =>
        a.organizationName
          .toLocaleLowerCase()
          .localeCompare(b.organizationName.toLocaleLowerCase())
      );
  }
);

export const serviceSectionsSelector3 = createSelector(
  [servicesSelector, organizationNamesByFiscalCodeSelector],
  (services, organizations) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const organizationName = organizations[fiscalCode] || fiscalCode;
        const organizationFiscalCode = fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined);

        const hasNationalServices = true;

        return {
          organizationName,
          organizationFiscalCode,
          hasNationalServices,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) =>
        a.organizationName
          .toLocaleLowerCase()
          .localeCompare(b.organizationName.toLocaleLowerCase())
      );
  }
);

export const nationalServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const organizationName = organizations[fiscalCode] || fiscalCode;
        const organizationFiscalCode = fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];

        const data = serviceIdsForOrg
          .map(id => services.byId[id])
          .filter(isDefined)
          .filter(service => {
            const id = pot.isSome(service)
              ? service.value.service_id
              : undefined;
            if (id) {
              const potServiceMetadata = servicesMetadata.byId[id] || pot.none;
              const serviceMetadata = pot.getOrElse(
                potServiceMetadata,
                {} as pot.PotType<typeof potServiceMetadata>
              );

              return serviceMetadata.scope === "NATIONAL";
            } else {
              return undefined;
            }
          });
        return {
          organizationName,
          organizationFiscalCode,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) =>
        a.organizationName
          .toLocaleLowerCase()
          .localeCompare(b.organizationName.toLocaleLowerCase())
      );
  }
);

export const nationalServiceSectionsSelector2 = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) => {
    const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
    return orgfiscalCodes
      .map(fiscalCode => {
        const organizationName = organizations[fiscalCode] || fiscalCode;
        const organizationFiscalCode = fiscalCode;
        const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];
        const data = serviceIdsForOrg
          .map(id => {
            const serviceData = services.byId[id];
            const potServiceMetadata = servicesMetadata.byId[id] || pot.none;
            const serviceMetadata = pot.getOrElse(
              potServiceMetadata,
              {} as pot.PotType<typeof potServiceMetadata>
            );

            return {
              serviceData,
              serviceMetadata
            };
          })
          .filter(isDefined);
        return {
          organizationName,
          organizationFiscalCode,
          data
        };
      })
      .filter(_ => _.data.length > 0)
      .sort((a, b) =>
        a.organizationName
          .toLocaleLowerCase()
          .localeCompare(b.organizationName.toLocaleLowerCase())
      );
  }
);
