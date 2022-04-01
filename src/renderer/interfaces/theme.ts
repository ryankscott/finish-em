import CSS from 'csstype';

export type ThemeType = {
  name: string;
  font: {
    sansSerif: CSS.Properties['fontFamily'];
  };
  fontSizes: {
    xxxsmall: CSS.Properties['fontSize'];
    xxsmall: CSS.Properties['fontSize'];
    xsmall: CSS.Properties['fontSize'];
    small: CSS.Properties['fontSize'];
    regular: CSS.Properties['fontSize'];
    large: CSS.Properties['fontSize'];
    xlarge: CSS.Properties['fontSize'];
    xxlarge: CSS.Properties['fontSize'];
    xxxlarge: CSS.Properties['fontSize'];
  };
  fontWeights: {
    thin: number;
    regular: number;
    bold: number;
    xbold: number;
  };
  button: {
    default: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    invert: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    primary: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    error: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    subtle: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    subtleInvert: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
    disabled: {
      backgroundColour: CSS.Properties['color'];
      colour: CSS.Properties['color'];
      borderColour: CSS.Properties['color'];
      hoverBackgroundColour: CSS.Properties['color'];
    };
  };
  colours: {
    textColour: CSS.Properties['color'];
    disabledTextColour: CSS.Properties['color'];
    altTextColour: CSS.Properties['color'];
    primaryColour: CSS.Properties['color'];
    secondaryColour: CSS.Properties['color'];
    tertiaryColour: CSS.Properties['color'];
    quarternaryColour: CSS.Properties['color'];
    penternaryColour: CSS.Properties['color'];
    backgroundColour: CSS.Properties['color'];
    borderColour: CSS.Properties['color'];
    altBorderColour: CSS.Properties['color'];
    altBackgroundColour: CSS.Properties['color'];
    dialogBackgroundColour: CSS.Properties['color'];
    focusDialogBackgroundColour: CSS.Properties['color'];
    altDialogBackgroundColour: CSS.Properties['color'];
    focusAltDialogBackgroundColour: CSS.Properties['color'];
    focusBackgroundColour: CSS.Properties['color'];
    focusBorderColour: CSS.Properties['color'];
    okColour: CSS.Properties['color'];
    neutralColour: CSS.Properties['color'];
    errorColour: CSS.Properties['color'];
    errorBackgroundColour: CSS.Properties['color'];
    staleBackgroundColour: CSS.Properties['color'];
    warningColour: CSS.Properties['color'];
    iconColour: CSS.Properties['color'];
    altIconColour: CSS.Properties['color'];
    headerBackgroundColour: CSS.Properties['color'];
    headerTextColour: CSS.Properties['color'];
  };
};

export type fontSizeType =
  | 'xxxsmall'
  | 'xxsmall'
  | 'xsmall'
  | 'small'
  | 'regular'
  | 'large'
  | 'xlarge'
  | 'xxlarge'
  | 'xxxlarge';

export type fontWeightType = 'thin' | 'regular' | 'bold' | 'xbold';
