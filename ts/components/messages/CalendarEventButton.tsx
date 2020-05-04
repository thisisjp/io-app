import { fromNullable, none, Option, some } from "fp-ts/lib/Option";
import { Text } from "native-base";
import React, { ReactNode } from "react";
import { Alert, Dimensions, StyleSheet } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import I18n from "../../i18n";
import {
  addCalendarEvent,
  AddCalendarEventPayload,
  removeCalendarEvent,
  RemoveCalendarEventPayload
} from "../../store/actions/calendarEvents";
import { preferredCalendarSaveSuccess } from "../../store/actions/persistedPreferences";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { preferredCalendarSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import customVariables from "../../theme/variables";
import { openAppSettings } from "../../utils/appSettings";
import {
  checkAndRequestPermission,
  convertLocalCalendarName
} from "../../utils/calendar";
import { formatDateAsReminder } from "../../utils/dates";
import { showToast } from "../../utils/showToast";
import ButtonDefaultOpacity from "../ButtonDefaultOpacity";
import SelectCalendarModal from "../SelectCalendarModal";
import IconFont from "../ui/IconFont";

type OwnProps = {
  small?: boolean;
  disabled?: boolean;
  hideModal: () => void;
  showModal: (component: ReactNode) => void;
  message: CreatedMessageWithContent;
};

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  ReturnType<typeof mapDispatchToProps>;

type State = {
  // Store if the event is in the device calendar
  isEventInDeviceCalendar: boolean;
};

const baseStyles = StyleSheet.create({
  button: {
    flex: 5,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 0,
    height: 40
  },

  icon: {
    lineHeight: 24
  },

  text: {
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
    fontSize: 14,
    lineHeight: 20
  }
});

const validStyles = StyleSheet.create({
  button: {
    backgroundColor: customVariables.colorWhite,
    borderWidth: 1,
    borderColor: customVariables.brandPrimary
  },

  icon: {
    color: customVariables.brandPrimary
  },

  text: {
    color: customVariables.brandPrimary
  }
});

const smallStyles = StyleSheet.create({
  button: {
    height: 32
  },

  icon: {},

  text: {}
});

const disabledStyles = StyleSheet.create({
  button: {
    backgroundColor: "#b5b5b5",
    borderWidth: 0
  },

  icon: {
    color: customVariables.colorWhite
  },

  text: {
    color: customVariables.colorWhite
  }
});

const screenWidth = Dimensions.get("window").width;
const minScreenWidth = 320;
// On small devices use short label
const reminderText = I18n.t(
  screenWidth <= minScreenWidth
    ? "messages.cta.reminderShort"
    : "messages.cta.reminder"
);

class CalendarEventButton extends React.PureComponent<Props, State> {
  public componentDidMount() {
    const { calendarEvent } = this.props;

    // If we have a calendar event in the store associated to this message
    // Check if the event is still in the device calendar
    this.checkIfEventInCalendar(calendarEvent);
  }

  public componentDidUpdate(prevProps: Props) {
    // if calenderEvent changes means reminder has been changed
    if (prevProps.calendarEvent !== this.props.calendarEvent) {
      // if a calendarEvent exists we have to check if it really exists as calendar event
      // the event can be removed outside the App.
      this.checkIfEventInCalendar(this.props.calendarEvent);
    }
  }

  /**
   * A function to check if the eventId of the CalendarEvent stored in redux
   * is really/still in the device calendar.
   * It is important to make this check because the event can be removed outside
   * the App.
   */
  private checkIfEventInCalendar = (
    calendarEvent: CalendarEvent | undefined
  ) => {
    if (calendarEvent === undefined) {
      this.setState({
        isEventInDeviceCalendar: false
      });
      return;
    }
    checkAndRequestPermission()
      .then(
        hasPermission => {
          if (hasPermission) {
            RNCalendarEvents.findEventById(calendarEvent.eventId)
              .then(
                event => {
                  if (event) {
                    // The event is in the store and also in the device calendar
                    // Update the state to display and handle the reminder button correctly
                    this.setState({
                      isEventInDeviceCalendar: true
                    });
                  } else {
                    // The event is in the store but not in the device calendar.
                    // Remove it from store too
                    this.props.removeCalendarEvent(calendarEvent);
                  }
                },
                // handle promise rejection
                () => {
                  this.setState({
                    isEventInDeviceCalendar: false
                  });
                }
              )
              .catch();
          }
        },
        // handle promise rejection
        // tslint:disable-next-line: no-identical-functions
        () => {
          this.setState({
            isEventInDeviceCalendar: false
          });
        }
      )
      .catch();
  };

  /**
   * Check if an event for endDate with that title already exists in the calendar.
   * Return the event id if it is found
   */
  private searchEventInCalendar = async (
    endDate: Date,
    title: string
  ): Promise<Option<string>> => {
    const startDate = new Date(endDate.getTime());
    return RNCalendarEvents.fetchAllEvents(
      formatDateAsReminder(new Date(startDate.setDate(endDate.getDate() - 1))),
      formatDateAsReminder(endDate)
    )
      .then(
        events => {
          return fromNullable(events)
            .mapNullable(evs =>
              evs.find(e => {
                return (
                  e.title === title &&
                  new Date(e.endDate).getDay() === endDate.getDay()
                );
              })
            )
            .map(ev => some(ev.id))
            .getOrElse(none);
        },
        // handle promise rejection
        () => {
          return none;
        }
      )
      .catch(() => none);
  };

  private saveCalendarEvent = (
    calendar: Calendar,
    message: CreatedMessageWithContent,
    dueDate: Date,
    title: string
  ) =>
    RNCalendarEvents.saveEvent(title, {
      calendarId: calendar.id,
      startDate: formatDateAsReminder(dueDate),
      endDate: formatDateAsReminder(dueDate),
      allDay: true,
      alarms: []
    })
      .then(eventId => {
        showToast(
          I18n.t("messages.cta.reminderAddSuccess", {
            title,
            calendarTitle: convertLocalCalendarName(calendar.title)
          }),
          "success"
        );
        // Add the calendar event to the store
        this.props.addCalendarEvent({
          messageId: message.id,
          eventId
        });

        this.setState({
          isEventInDeviceCalendar: true
        });
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderAddFailure"), "danger")
      );

  private confirmSaveCalendarEventAlert = (
    calendar: Calendar,
    message: CreatedMessageWithContent,
    dueDate: Date,
    title: string,
    eventId: string
  ) =>
    Alert.alert(
      I18n.t("messages.cta.reminderAlertTitle"),
      I18n.t("messages.cta.reminderAlertDescription"),
      [
        {
          text: I18n.t("global.buttons.cancel"),
          style: "cancel"
        },
        {
          text: I18n.t("messages.cta.reminderAlertKeep"),
          style: "default",
          onPress: () =>
            this.setState(
              {
                isEventInDeviceCalendar: true
              },
              () => {
                // Add the calendar event to the store
                this.props.addCalendarEvent({
                  messageId: message.id,
                  eventId
                });
              }
            )
        },
        {
          text: I18n.t("messages.cta.reminderAlertAdd"),
          style: "default",
          onPress: () =>
            this.saveCalendarEvent(calendar, message, dueDate, title)
        }
      ],
      { cancelable: false }
    );

  private addCalendarEventToDeviceCalendar = (
    message: CreatedMessageWithContent,
    dueDate: Date
  ) => (calendar: Calendar) => {
    const title = I18n.t("messages.cta.reminderTitle", {
      title: message.content.subject
    });

    const { preferredCalendar } = this.props;

    this.props.hideModal();

    if (preferredCalendar === undefined) {
      this.props.preferredCalendarSaveSuccess(calendar);
    }

    this.searchEventInCalendar(dueDate, title)
      .then(mayBeEventId =>
        mayBeEventId.foldL(
          async () => {
            await this.saveCalendarEvent(calendar, message, dueDate, title);
          },
          async eventId => {
            this.confirmSaveCalendarEventAlert(
              calendar,
              message,
              dueDate,
              title,
              eventId
            );
          }
        )
      )
      .catch(() => this.saveCalendarEvent(calendar, message, dueDate, title));
  };

  private removeCalendarEventFromDeviceCalendar = (
    calendarEvent: CalendarEvent | undefined
  ) => {
    if (calendarEvent) {
      RNCalendarEvents.removeEvent(calendarEvent.eventId)
        .then(_ => {
          showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
          this.props.removeCalendarEvent({
            messageId: calendarEvent.messageId
          });
          this.setState({
            isEventInDeviceCalendar: false
          });
        })
        .catch(_ =>
          showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
        );
    } else {
      showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger");
    }
  };

  // Create an action to add or remove the event
  private onPressHandler = () => {
    const isEventInDeviceCalendar = this.state;
    const { preferredCalendar, message, calendarEvent } = this.props;

    const { due_date } = message.content;

    if (due_date === undefined) {
      return;
    }

    // Check the authorization status
    checkAndRequestPermission()
      .then(calendarPermission => {
        if (calendarPermission.authorized) {
          if (isEventInDeviceCalendar) {
            // If the event is in the calendar prompt an alert and ask for confirmation
            Alert.alert(
              I18n.t("messages.cta.reminderRemoveRequest.title"),
              undefined,
              [
                {
                  text: I18n.t("messages.cta.reminderRemoveRequest.cancel"),
                  style: "cancel"
                },
                {
                  text: I18n.t("messages.cta.reminderRemoveRequest.ok"),
                  style: "destructive",
                  onPress: () => {
                    // after confirmation remove it
                    this.removeCalendarEventFromDeviceCalendar(calendarEvent);
                  }
                }
              ],
              { cancelable: false }
            );
          } else if (preferredCalendar !== undefined && due_date) {
            this.addCalendarEventToDeviceCalendar(message, due_date)(
              preferredCalendar
            );
          } else {
            // The event need to be added
            // Show a modal to let the user select a calendar
            this.props.showModal(
              <SelectCalendarModal
                onCancel={this.props.hideModal}
                onCalendarSelected={this.addCalendarEventToDeviceCalendar(
                  message,
                  due_date
                )}
              />
            );
          }
        } else if (!calendarPermission.asked) {
          // Authorized is false (denied, restricted or undetermined)
          // If the user denied permission previously (not in this session)
          // prompt an alert to inform that his calendar permissions could have been turned off
          Alert.alert(
            I18n.t("messages.cta.calendarPermDenied.title"),
            undefined,
            [
              {
                text: I18n.t("messages.cta.calendarPermDenied.cancel"),
                style: "cancel"
              },
              {
                text: I18n.t("messages.cta.calendarPermDenied.ok"),
                style: "default",
                onPress: () => {
                  // open app settings to turn on the calendar permissions
                  openAppSettings();
                }
              }
            ],
            { cancelable: true }
          );
        }
      })
      // No permission to add/remove the reminder
      .catch();
  };

  public render() {
    const { small, disabled } = this.props;
    const iconName = this.state.isEventInDeviceCalendar
      ? "io-tick-big"
      : "io-plus";
    return (
      <ButtonDefaultOpacity
        disabled={disabled}
        onPress={this.onPressHandler}
        style={[
          baseStyles.button,
          validStyles.button,
          small && smallStyles.button,
          disabled && disabledStyles.button
        ]}
      >
        <IconFont
          name={iconName}
          style={[
            baseStyles.icon,
            validStyles.icon,
            small && smallStyles.icon,
            disabled && disabledStyles.icon
          ]}
        />

        <Text
          style={[
            baseStyles.text,
            validStyles.text,
            small && smallStyles.text,
            disabled && disabledStyles.text
          ]}
        >
          {reminderText}
        </Text>
      </ButtonDefaultOpacity>
    );
  }
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  preferredCalendar: preferredCalendarSelector(state),
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addCalendarEvent: (calendarEvent: AddCalendarEventPayload) =>
    dispatch(addCalendarEvent(calendarEvent)),
  removeCalendarEvent: (calendarEvent: RemoveCalendarEventPayload) =>
    dispatch(removeCalendarEvent(calendarEvent)),
  preferredCalendarSaveSuccess: (calendar: Calendar) =>
    dispatch(
      preferredCalendarSaveSuccess({
        preferredCalendar: calendar
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CalendarEventButton);
