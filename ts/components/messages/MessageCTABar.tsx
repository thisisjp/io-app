import { isSome, none } from "fp-ts/lib/Option";
import { RptIdFromString } from "italia-pagopa-commons/lib/pagopa";
import * as pot from "italia-ts-commons/lib/pot";
import { Button, H1, Icon, Text, View } from "native-base";
import * as React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import RNCalendarEvents, { Calendar } from "react-native-calendar-events";
import { connect } from "react-redux";

import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import I18n from "../../i18n";
import {
  addCalendarEvent,
  removeCalendarEvent
} from "../../store/actions/calendarEvents";
import { navigateToPaymentTransactionSummaryScreen } from "../../store/actions/navigation";
import { ReduxProps } from "../../store/actions/types";
import { paymentInitializeState } from "../../store/actions/wallet/payment";
import {
  CalendarEvent,
  calendarEventByMessageIdSelector
} from "../../store/reducers/entities/calendarEvents/calendarEventsByMessageId";
import { PaymentByRptIdState } from "../../store/reducers/entities/payments";
import { GlobalState } from "../../store/reducers/types";
import variables from "../../theme/variables";
import { MessageWithContentPO } from "../../types/MessageWithContentPO";
import { checkAndRequestPermission } from "../../utils/calendar";
import {
  formatDateAsDay,
  formatDateAsMonth,
  formatDateAsReminder
} from "../../utils/dates";
import {
  formatPaymentAmount,
  getAmountFromPaymentAmount,
  getRptIdFromNoticeNumber
} from "../../utils/payment";
import { showToast } from "../../utils/showToast";
import CalendarIconComponent from "../CalendarIconComponent";
import SelectCalendarModal from "../SelectCalendarModal";

type OwnProps = {
  message: MessageWithContentPO;
  service: pot.Pot<ServicePublic, Error>;
  containerStyle?: ViewStyle;
  paymentByRptId: PaymentByRptIdState;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps> & ReduxProps;

type State = {
  isEventInCalendar: boolean;
  isSelectCalendarModalOpen: boolean;
};

const styles = StyleSheet.create({
  mainContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "row"
  },

  reminderContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 6,
    alignItems: "center"
  },
  reminderButtonContainer: {
    marginLeft: 10,
    flex: 12
  },

  separatorContainer: {
    width: 10
  },

  paymentContainer: {
    flex: 6
  }
});

const SelectCalendarModalHeader = (
  <H1>{I18n.t("messages.cta.reminderCalendarSelect")}</H1>
);

class MessageCTABar extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isEventInCalendar: false,
      isSelectCalendarModalOpen: false
    };
  }

  private renderReminderCTA(
    dueDate: NonNullable<MessageWithContentPO["content"]["due_date"]>,
    calendarEvent?: CalendarEvent
  ) {
    const { isEventInCalendar } = this.state;

    const onPressHandler =
      calendarEvent && isEventInCalendar
        ? // Create an action to remove the event from the calendar
          () =>
            checkAndRequestPermission()
              .then(hasPermission => {
                if (hasPermission) {
                  this.removeReminderFromCalendar(calendarEvent);
                }
              }) // No permission to add the reminder
              .catch()
        : // Create an action that open the Calendar to let the user add an event
          // Check the autorization status
          () =>
            checkAndRequestPermission()
              .then(hasPermission => {
                if (hasPermission) {
                  this.setState({
                    isSelectCalendarModalOpen: true
                  });
                }
              })
              // No permission to add the reminder
              .catch();

    return (
      <View style={styles.reminderContainer}>
        <CalendarIconComponent
          height="48"
          width="48"
          month={formatDateAsMonth(dueDate)}
          day={formatDateAsDay(dueDate)}
          backgroundColor={variables.brandDarkGray}
          textColor={variables.colorWhite}
        />

        <View style={styles.reminderButtonContainer}>
          <Button block={true} bordered={true} onPress={onPressHandler}>
            <Icon
              name={
                isEventInCalendar
                  ? "remove-circle-outline"
                  : "add-circle-outline"
              }
            />
            <Text>{I18n.t("messages.cta.reminder")}</Text>
          </Button>
        </View>
      </View>
    );
  }

  private renderPaymentCTA(
    paymentData: NonNullable<MessageWithContentPO["content"]["payment_data"]>,
    potService: pot.Pot<ServicePublic, Error>,
    paymentByRptId: PaymentByRptIdState
  ) {
    const amount = getAmountFromPaymentAmount(paymentData.amount);

    const rptId = pot.getOrElse(
      pot.map(potService, service =>
        getRptIdFromNoticeNumber(
          service.organization_fiscal_code,
          paymentData.notice_number
        )
      ),
      none
    );

    const isPaid = rptId
      .map(RptIdFromString.encode)
      .map(_ => paymentByRptId[_] !== undefined)
      .getOrElse(false);

    const onPaymentCTAPress =
      !isPaid && isSome(amount) && isSome(rptId)
        ? () => {
            this.props.dispatch(paymentInitializeState());
            this.props.dispatch(
              navigateToPaymentTransactionSummaryScreen({
                rptId: rptId.value,
                initialAmount: amount.value
              })
            );
          }
        : undefined;

    return (
      <View style={styles.paymentContainer}>
        <Button
          block={true}
          onPress={onPaymentCTAPress}
          disabled={onPaymentCTAPress === undefined || isPaid}
        >
          <Text>
            {I18n.t(isPaid ? "messages.cta.paid" : "messages.cta.pay", {
              amount: formatPaymentAmount(paymentData.amount)
            })}
          </Text>
        </Button>
      </View>
    );
  }

  public componentDidMount() {
    const { calendarEvent } = this.props;

    if (calendarEvent) {
      this.checkIfEventInCalendar(calendarEvent);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { calendarEvent: prevCalendarEvent } = prevProps;
    const { calendarEvent } = this.props;

    if (calendarEvent && calendarEvent !== prevCalendarEvent) {
      this.checkIfEventInCalendar(calendarEvent);
    }
  }

  public render() {
    const {
      message,
      service,
      containerStyle,
      paymentByRptId,
      calendarEvent
    } = this.props;
    const { isSelectCalendarModalOpen } = this.state;

    const { due_date, payment_data } = message.content;

    if (due_date !== undefined || payment_data !== undefined) {
      return (
        <View style={[styles.mainContainer, containerStyle]}>
          {due_date !== undefined && (
            <React.Fragment>
              {isSelectCalendarModalOpen && (
                <SelectCalendarModal
                  onCancel={this.onSelectCalendarCancel}
                  onCalendarSelected={(calendar: Calendar) =>
                    this.addReminderToCalendar(message, calendar, due_date)
                  }
                  header={SelectCalendarModalHeader}
                />
              )}
              {this.renderReminderCTA(due_date, calendarEvent)}
            </React.Fragment>
          )}

          {due_date !== undefined &&
            payment_data !== undefined && (
              <View style={styles.separatorContainer} />
            )}

          {payment_data !== undefined &&
            this.renderPaymentCTA(payment_data, service, paymentByRptId)}
        </View>
      );
    }

    return null;
  }

  private onSelectCalendarCancel = () => {
    this.setState({
      isSelectCalendarModalOpen: false
    });
  };

  private checkIfEventInCalendar = (calendarEvent: CalendarEvent) => {
    checkAndRequestPermission()
      .then(hasPermission => {
        if (hasPermission) {
          RNCalendarEvents.findEventById(calendarEvent.eventId)
            .then(_ =>
              this.setState({
                isEventInCalendar: true
              })
            )
            .catch();
        }
      })
      .catch();
  };

  private removeReminderFromCalendar = (calendarEvent: CalendarEvent) => {
    RNCalendarEvents.removeEvent(calendarEvent.eventId)
      .then(_ => {
        showToast(I18n.t("messages.cta.reminderRemoveSuccess"), "success");
        this.props.dispatch(
          removeCalendarEvent({ messageId: calendarEvent.messageId })
        );
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderRemoveFailure"), "danger")
      );
  };

  private addReminderToCalendar = (
    message: MessageWithContentPO,
    calendar: Calendar,
    dueDate: Date
  ) => {
    const title = I18n.t("messages.cta.reminderTitle", {
      title: message.content.subject
    });
    this.setState({
      isSelectCalendarModalOpen: false
    });
    RNCalendarEvents.saveEvent(title, {
      title,
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
            calendarTitle: calendar.title
          }),
          "success"
        );
        // Add the event to the store
        this.props.dispatch(
          addCalendarEvent({
            messageId: message.id,
            eventId
          })
        );
      })
      .catch(_ =>
        showToast(I18n.t("messages.cta.reminderAddFailure"), "danger")
      );
  };
}

const mapStateToProps = (state: GlobalState, ownProps: OwnProps) => ({
  calendarEvent: calendarEventByMessageIdSelector(ownProps.message.id)(state)
});

export default connect(mapStateToProps)(MessageCTABar);
