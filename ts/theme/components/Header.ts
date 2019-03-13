import { Platform } from "react-native";

import { makeFontStyleObject } from "../fonts";
import { Theme } from "../types";
import variables from "../variables";

declare module "native-base" {
  namespace NativeBase {
    interface Header {
      primary?: boolean;
    }
  }
}

export default (): Theme => {
  return {
    "NativeBase.Left": {
      "NativeBase.Button": {
        "UIComponent.IconFont": {
          color: variables.textColor
        },
        padding: 0,
        justifyContent: "center"
      },

      minWidth: variables.headerButtonMinWidth,
      paddingLeft: 0,
      flex: 0,
      marginRight: 10
    },

    "NativeBase.Body": {
      "NativeBase.Button": {
        alignSelf: "flex-start",
        minWidth: variables.headerButtonMinWidth
      },
      "NativeBase.Text": {
        ...makeFontStyleObject(Platform.select, variables.headerBodyFontWeight),
        backgroundColor: "transparent",
        color: variables.toolbarTextColor,
        fontSize: variables.headerBodyFontSize
      }
    },

    "NativeBase.Right": {
      flex: 0,
      marginLeft: 10
    },

    ".primary": {
      backgroundColor: variables.contentPrimaryBackground,
      "NativeBase.Right": {
        "NativeBase.Button": {
          "UIComponent.IconFont": {
            color: variables.brandPrimaryInverted
          },

          minWidth: variables.headerButtonMinWidth
        }
      }
    },

    borderBottomWidth: variables.headerBorderBottomWidth,
    elevation: 0,
    paddingHorizontal: variables.headerPaddingHorizontal / 2,
    shadowColor: undefined,
    shadowOffset: undefined,
    shadowOpacity: undefined,
    shadowRadius: undefined
  };
};
