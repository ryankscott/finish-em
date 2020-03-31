import { lighten, darken } from "polished";
import { formatRelative } from "date-fns";

export const theme = {
  font: {
    sansSerif: "-apple-system, BlinkMacSystemFont, Helvetica, sans-serif"
  },
  fontSizes: {
    xsmall: "13px",
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
  button: {
    primary: {
      backgroundColour: "#45b9ef",
      colour: "#EEEEEE",
      borderColour: "#45b9ef",
      hoverBackgroundColour: darken(0.05, "#45b9ef")
    },
    error: {
      backgroundColour: "#fe5e41",
      colour: "#EEEEEE",
      borderColour: "#fe5e41",
      hoverBackgroundColour: darken(0.05, "#fe5e41")
    }
  },
  colours: {
    defaultTextColour: "#333333",
    disabledTextColour: lighten(0.35, "#333333"),
    altTextColour: "#EEEEEE",
    primaryColour: "#45b9ef",
    secondaryColour: "#59cd90",
    tertiaryColour: "#fe5e41",
    quarternaryColour: "#f9df77",
    penternaryColour: "#511a37",
    borderColour: "#e0e0e0",
    backgroundColour: "#Fbfbfb",
    altBackgroundColour: "#404040",
    lightDialogBackgroundColour: "#F0f0f0",
    focusLightDialogBackgroundColour: darken(0.05, "#F0f0f0"),
    darkDialogBackgroundColour: "#404040",
    focusDarkDialogBackgroundColour: lighten(0.05, "#404040"),
    focusBackgroundColour: darken(0.05, "#FEFEFE"), // TODO: How to get it to refer to backgroundColour
    focusBorderColour: lighten(0.05, "#e0e0e0"), // TODO: How to get it to refer to backgroundColour
    okColour: "#59cd90",
    neutralColour: "#45b9ef",
    errorColour: "#fe5e41",
    warningColour: "#f9df77"
  }
};

export const selectStyles = {
  container: () => ({
    zIndex: 2,
  }),
  input: () => ({
    padding: "5px 0px",
    fontFamily: theme.font.sansSerif,
    color: theme.colours.defaultTextColour,
    zIndex: 2,
  }),
  menu: (provided, state) => ({
    margin: "2px 0px",
    padding: "5px 0px",
    border: "1px solid",
    backgroundColor: theme.colours.backgroundColour,
    borderColor: theme.colours.borderColour,
    borderRadius: "5px",
    tabIndex: 0,
    zIndex: 2,
  }),
  option: (provided, state) => ({
    ...provided,
    tabIndex: 0,
    color: theme.colours.defaultTextColour,
    backgroundColor: state.isFocused
      ? theme.colours.focusBackgroundColour
      : theme.colours.backgroundColour,
    padding: "5px 10px",
    margin: "0px",
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    fontWeight: state.isFocused
      ? theme.fontWeights.bold
      : theme.fontWeights.regular,
    zIndex: 2,
  }),
  placeholder: () => ({
    color: theme.colours.defaultTextColour,
    backgroundColor: theme.colours.backgroundColour
  }),
  control: () => ({
    width: "100%",
    margin: 0,
    padding: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    backgroundColor: theme.colours.backgroundColour,
    border: "1px solid",
    borderColor: theme.colours.borderColour,
    borderRadius: "5px",
    zIndex: 2,
  }),
  singleValue: (provided, state) => ({}),
  indicatorsContainer: () => ({ display: "none" }),
  dropdownIndicator: () => ({
    display: "none"
  }),
  noOptionsMessage: () => ({
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    fontWeight: theme.fontWeights.thin,
    padding: "2px 5px"
  })
};
