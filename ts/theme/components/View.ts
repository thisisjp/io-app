import * as ReactNative from "react-native";
import { Theme } from "../types";
import variables from "../variables";
import customVariables from "../variables";

declare module "native-base" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NativeBase {
    interface View extends ReactNative.ViewProperties {
      spacer?: boolean;
      hspacer?: boolean;
      xsmall?: boolean;
      small?: boolean;
      large?: boolean;
      extralarge?: boolean;
      modal?: boolean;
      footer?: boolean;
      header?: boolean;
      content?: boolean;
      padded?: boolean;
      centerJustified?: boolean;
    }
  }
}

/**
 * TODO:
 * if no components are inserted as footer, the following component should be
 * included at the bottom of the screen to show the proper shadow upside the navigation bar:
 *
 * <View footer={true} noPadded={true}/>
 *
 * TODO: check if this rule is still valid or a workaround has been implemented to avoid it been manually done
 * https://www.pivotaltracker.com/story/show/170819564
 */

export default (): Theme => ({
    ".spacer": {
      xsmall: {
        height: customVariables.spacerExtrasmallHeight
      },
      ".xsmall": {
        height: customVariables.spacerExtrasmallHeight
      },
      ".small": {
        height: customVariables.spacerSmallHeight
      },
      ".large": {
        height: variables.spacerLargeHeight
      },
      ".extrasmall": {
        height: variables.spacerExtrasmallHeight
      },

      ".extralarge": {
        height: variables.spacerExtralargeHeight
      },

      height: variables.spacerHeight
    },

    // horizontal spacer
    ".hspacer": {
      ".small": {
        width: variables.spacerSmallHeight
      },
      ".large": {
        width: variables.spacerLargeWidth
      },
      ".extralarge": {
        width: variables.spacerExtralargeWidth
      },
      width: variables.spacerWidth
    },

    ".modal": {
      flex: 1,
      backgroundColor: variables.contentBackground
    },

    ".padded": {
      paddingBottom: 15
    },

    ".footer": {
      backgroundColor: variables.footerBackground,
      paddingBottom: variables.footerPaddingBottom,
      paddingLeft: variables.footerPaddingLeft,
      paddingRight: variables.footerPaddingRight,
      paddingTop: variables.footerPaddingTop,
      borderBottomWidth: variables.footerBottomBorderWidth,
      borderBottomColor: variables.brandGray,
      // iOS shadow
      shadowColor: variables.footerShadowColor,
      shadowOffset: {
        width: variables.footerShadowOffsetWidth,
        height: variables.footerShadowOffsetHeight
      },
      shadowOpacity: variables.footerShadowOpacity,
      shadowRadius: variables.footerShadowRadius,
      // Android shadow
      elevation: variables.footerElevation
    },
    ".content": {
      padding: variables.contentPadding,
      backgroundColor: variables.contentBackground,
      flex: 1
    },
    ".centerJustified": {
      flex: 1,
      justifyContent: "center"
    }
  });
