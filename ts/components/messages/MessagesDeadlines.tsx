import { compareAsc, format, startOfDay } from "date-fns";
import { none, Option, some } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { View } from "native-base";
import React from "react";
import {
  SectionList,
  SectionListData,
  SectionListRenderItem,
  StyleSheet
} from "react-native";

import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";
import customVariables from "../../theme/variables";
import {
  isMessageWithContentAndDueDatePO,
  MessageWithContentAndDueDatePO
} from "../../types/MessageWithContentAndDueDatePO";
import H5 from "../ui/H5";
import MessagesDeadlinesItem from "./MessagesDeadlinesItem";

const styles = StyleSheet.create({
  listWrapper: {
    flex: 1
  },
  sectionHeader: {
    paddingHorizontal: customVariables.contentPadding,
    paddingVertical: customVariables.contentPadding / 2,
    backgroundColor: customVariables.brandLightGray
  },
  itemSeparator: {
    height: 1,
    backgroundColor: customVariables.brandLightGray
  }
});

type Props = {
  messagesStateInfo: ReturnType<
    typeof lexicallyOrderedMessagesStateInfoSelector
  >;
  refreshMessages: () => void;
  onPressItem: (id: string) => void;
};

type Section = {
  title: string;
  // Can't use ReadonlyArray because SectionList section data need to be
  // a normal array.
  // tslint:disable-next-line:readonly-array
  data: MessageWithContentAndDueDatePO[];
};

const keyExtractor = (item: MessageWithContentAndDueDatePO) => item.id;

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

const generateSections = (
  potMessageStates: pot.Pot<ReadonlyArray<MessageState>, string>
) =>
  pot.getOrElse(
    pot.map(
      potMessageStates,
      _ =>
        // tslint:disable-next-line:readonly-array
        _.reduce<MessageWithContentAndDueDatePO[]>(
          (accumulator, messageState) => {
            const message = messageState.message;
            if (
              pot.isSome(message) &&
              isMessageWithContentAndDueDatePO(message.value)
            ) {
              accumulator.push(message.value);
            }

            return accumulator;
          },
          []
        )
          // Sort by due_date
          .sort((d1, d2) =>
            compareAsc(d1.content.due_date, d2.content.due_date)
          )
          // Now we have an array of messages sorted by due_date.
          // To create groups (by due_date day) we can just iterate the array and
          // -  if the current message due_date day is different from the one of
          //    the prevMessage create a new section
          // -  if the current message due_date day is equal to the one of prevMessage
          //    add the message to the last section
          .reduce<{
            lastTitle: Option<string>;
            // tslint:disable-next-line:readonly-array
            sections: Section[];
          }>(
            (accumulator, message) => {
              const title = startOfDay(message.content.due_date).toISOString();
              if (
                accumulator.lastTitle.isNone() ||
                title !== accumulator.lastTitle.value
              ) {
                // We need to create a new section
                const newSection: Section = {
                  title,
                  data: [message]
                };
                return {
                  lastTitle: some(title),
                  sections: [...accumulator.sections, newSection]
                };
              } else {
                // We need to add the message to the last section
                const prevSection = accumulator.sections.pop() as Section;
                const newSection: Section = {
                  title,
                  data: [...prevSection.data, message]
                };
                return {
                  lastTitle: some(title),
                  sections: [...accumulator.sections, newSection]
                };
              }
            },
            {
              lastTitle: none,
              sections: []
            }
          ).sections
    ),
    []
  );

class MessagesDeadlines extends React.PureComponent<Props> {
  public render() {
    const { messagesStateInfo } = this.props;
    const isLoading = pot.isLoading(messagesStateInfo.potMessageState);
    const sections = generateSections(messagesStateInfo.potMessageState);
    return (
      <View style={styles.listWrapper}>
        <SectionList
          sections={sections}
          keyExtractor={keyExtractor}
          renderSectionHeader={this.renderSectionHeader}
          renderItem={this.renderItem}
          ItemSeparatorComponent={ItemSeparatorComponent}
          stickySectionHeadersEnabled={true}
          alwaysBounceVertical={false}
          refreshing={isLoading}
          onRefresh={this.props.refreshMessages}
        />
      </View>
    );
  }

  private renderSectionHeader = (info: {
    section: SectionListData<MessageWithContentAndDueDatePO>;
  }) => {
    return (
      <H5 style={styles.sectionHeader}>
        {format(info.section.title, "dddd D MMMM").toUpperCase()}
      </H5>
    );
  };

  private renderItem: SectionListRenderItem<
    MessageWithContentAndDueDatePO
  > = info => {
    const message = info.item;
    const { onPressItem } = this.props;
    return (
      <MessagesDeadlinesItem
        id={message.id}
        subject={message.content.subject}
        due_date={message.content.due_date}
        onPress={onPressItem}
      />
    );
  };
}

export default MessagesDeadlines;
