import { Text, View } from "native-base";
import React from "react";

import { MessageWithContentPO } from "../../types/MessageWithContentPO";

type Props = {
  id: string;
  subject: string;
  due_date: NonNullable<MessageWithContentPO["content"]["due_date"]>;
};

class DeadlinesItem extends React.PureComponent<Props> {
  public render() {
    const { subject, due_date } = this.props;

    return (
      <View>
        <Text>{subject}</Text>
        <Text>{due_date.toISOString()}</Text>
      </View>
    );
  }
}

export default DeadlinesItem;
