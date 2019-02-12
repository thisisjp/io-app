import * as pot from "italia-ts-commons/lib/pot";
import React from "react";

import { lexicallyOrderedMessagesStateInfoSelector } from "../../store/reducers/entities/messages";
import { MessageState } from "../../store/reducers/entities/messages/messagesById";

type Props = {
  messagesStateInfo: ReturnType<
    typeof lexicallyOrderedMessagesStateInfoSelector
  >;
};

const generateSections = (
  potMessageStates: pot.Pot<ReadonlyArray<MessageState>, string>
) => {
  if (pot.isSome(potMessageStates)) {
    return potMessageStates.value.filter(messageState => {
      const message = messageState.message;
      return (
        pot.isSome(message) && message.value.content.due_date !== undefined
      );
    });
  }

  return [];
};

class Deadlines extends React.PureComponent<Props> {
  public render() {
    const
  }
}

export default Deadlines;
