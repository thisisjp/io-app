/**
 * Services reducer
 */
import * as pot from "italia-ts-commons/lib/pot";
import { combineReducers } from "redux";
import { createSelector } from "reselect";

import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { Service as ServiceMetadata } from "../../../../../definitions/content/Service";
import { isDefined } from "../../../../utils/guards";
import { Action } from "../../../actions/types";
import { ServiceMetadataById, servicesMetadataSelector } from "../../content";
import { GlobalState } from "../../types";
import {
  organizationNamesByFiscalCodeSelector,
  OrganizationNamesByFiscalCodeState
} from "../organizations/organizationsByFiscalCodeReducer";
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

const getLocalizedServices = (
  service: pot.Pot<ServicePublic, Error>,
  servicesMetadataById: ServiceMetadataById,
  localization?: "NATIONAL" | "LOCAL"
) => {
  if (localization) {
    const id = pot.isSome(service) ? service.value.service_id : undefined;
    if (id) {
      const potServiceMetadata = servicesMetadataById[id] || pot.none;
      const serviceMetadata: ServiceMetadata = pot.getOrElse(
        potServiceMetadata,
        {} as pot.PotType<typeof potServiceMetadata>
      );

      return serviceMetadata.scope === localization;
    } else {
      return undefined;
    }
  } else {
    return true;
  }
};

const getGenericServices = (
  services: ServicesState,
  organizations: OrganizationNamesByFiscalCodeState,
  servicesMetadata: {
    byId: ServiceMetadataById;
  },
  localization?: "NATIONAL" | "LOCAL"
) => {
  const orgfiscalCodes = Object.keys(services.byOrgFiscalCode);
  return orgfiscalCodes
    .map(fiscalCode => {
      const organizationName = organizations[fiscalCode] || fiscalCode;
      const organizationFiscalCode = fiscalCode;
      const serviceIdsForOrg = services.byOrgFiscalCode[fiscalCode] || [];

      const data = serviceIdsForOrg
        .map(id => services.byId[id])
        .filter(isDefined)
        .filter(service =>
          getLocalizedServices(service, servicesMetadata.byId, localization)
        );
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
};

export const serviceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getGenericServices(services, organizations, servicesMetadata)
);

export const nationalServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getGenericServices(services, organizations, servicesMetadata, "NATIONAL")
);

// TODO: use this selector to display the content of the "Other services" tab
//        https://www.pivotaltracker.com/n/projects/2048617/stories/166818256
export const localServiceSectionsSelector = createSelector(
  [
    servicesSelector,
    organizationNamesByFiscalCodeSelector,
    servicesMetadataSelector
  ],
  (services, organizations, servicesMetadata) =>
    getGenericServices(services, organizations, servicesMetadata, "LOCAL")
);
