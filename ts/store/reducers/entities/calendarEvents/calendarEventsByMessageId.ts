import { getType } from "typesafe-actions";

import { addCalendarEvent } from "../../../actions/calendarEvents";
import { Action } from "../../../actions/types";

export type CalendarEvent = {
  messageId: string;
  eventId: string;
};

export type CalendarEventsByMessageIdState = {
  [key: string]: CalendarEvent;
};

export const INITIAL_STATE: CalendarEventsByMessageIdState = {};

const reducer = (
  state: CalendarEventsByMessageIdState = INITIAL_STATE,
  action: Action
): CalendarEventsByMessageIdState => {
  switch (action.type) {
    case getType(addCalendarEvent): {
      const messageId = action.payload.messageId;

      return {
        ...state,
        [messageId]: action.payload
      };
    }

    default:
      return state;
  }
};

export default reducer;
