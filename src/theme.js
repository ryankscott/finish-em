/**/
import { lighten, darken } from "polished";

export const theme = {
  font: {
    sansSerif: "-apple-system, BlinkMacSystemFont, Helvetica, sans-serif"
  },
  fontSizes: {
    xsmall: "12px",
    small: "14px",
    regular: "16px",
    large: "18px",
    xlarge: "22px",
    xxlarge: "28px",
    xxxlarge: "36px"
  },
  fontWeights: {
    thin: "100",
    regular: "300",
    bold: "500",
    xbold: "700"
  },
  colours: {
    defaultTextColour: "#333333",
    disabledTextColour: lighten(0.35, "#333333"),
    altTextColour: "#EEEEEE",
    primaryColour: "#45b9ef",
    primaryHoverColour: darken(0.05, "#45b9ef"),
    secondaryColour: "#59cd90",
    tertiaryColour: "#fe5e41",
    quarternaryColour: "#f9df77",
    penternaryColour: "#511a37",
    borderColour: "#e0e0e0",
    backgroundColour: "#Fbfbfb",
    lightDialogBackgroundColour: "#F0f0f0",
    altBackgroundColour: "#404040",
    focusBackgroundColour: darken(0.05, "#FEFEFE"), // TODO: How to get it to refer to backgroundColour
    focusBorderColour: lighten(0.05, "#e0e0e0"), // TODO: How to get it to refer to backgroundColour
    okColour: "#59cd90",
    neutralColour: "#45b9ef",
    errorColour: "#fe5e41",
    warningColour: "#f9df77"
  }
};
