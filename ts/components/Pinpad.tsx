import color from "color";
import * as React from "react";
import CodeInput from "react-native-confirmation-code-field";

import variables from "../theme/variables";
import { PinString } from "../types/PinString";
import { ExtractProps } from "../types/utils";
import { PIN_LENGTH } from "../utils/constants";

type OwnProps = Readonly<{
  autofocus: boolean;
  compareWithCode?: string;
  inactiveColor: string;
  activeColor: string;
  codeInputRef?: React.Ref<CodeInput>;
  onFulfill: (code: PinString, isMatching?: boolean) => void;
}>;

type Props = OwnProps;

const codeTextInputProps = () => ({
  secureTextEntry: true,
  style: { fontSize: variables.fontSize5, height: 56 }
});

/**
 * A customized CodeInput component.
 */
class Pinpad extends React.PureComponent<Props, {}> {
  private onFullfill: ExtractProps<CodeInput>["onFulfill"] = (
    code,
    isMatching
  ) => this.props.onFulfill(code as PinString, isMatching);

  public render() {
    const {
      autofocus,
      compareWithCode,
      inactiveColor,
      activeColor,
      codeInputRef
    } = this.props;

    return (
      <CodeInput
        keyboardType="numeric"
        autoFocus={autofocus}
        variant="border-b"
        codeLength={PIN_LENGTH}
        compareWithCode={compareWithCode || ""}
        cellBorderWidth={2}
        inactiveColor={color(inactiveColor)
          .rgb()
          .string()}
        activeColor={color(activeColor)
          .rgb()
          .string()}
        onFulfill={this.onFullfill}
        ref={codeInputRef}
        getInputProps={codeTextInputProps}
      />
    );
  }
}

export default Pinpad;
