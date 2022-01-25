import { lighten, darken } from 'polished'
import { ThemeType } from './interfaces'
import { createGlobalStyle } from './StyledComponents'


export const GlobalStyle = createGlobalStyle``

export const themes: { [key: string]: ThemeType } = {
  light: {
    name: 'Light',
    font: {
      sansSerif: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    },
    fontSizes: {
      xxxsmall: '10px',
      xxsmall: '11px',
      xsmall: '12px',
      small: '13px',
      regular: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '26px',
      xxxlarge: '34px',
    },
    fontWeights: {
      thin: 100,
      regular: 300,
      bold: 500,
      xbold: 700,
    },
    button: {
      default: {
        backgroundColour: '#F9F9F9',
        colour: '#333333',
        borderColour: 'transparent',
        hoverBackgroundColour: darken(0.05, '#F9F9F9'),
      },
      invert: {
        backgroundColour: '#404040',
        colour: '#F9F9F9',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.1, '#404040'),
      },
      primary: {
        backgroundColour: '#2FB1ED',
        colour: '#EEEEEE',
        borderColour: '#2FB1ED',
        hoverBackgroundColour: darken(0.05, '#2FB1ED'),
      },
      error: {
        backgroundColour: '#FF0080',
        colour: '#EEEEEE',
        borderColour: '#FF0080',
        hoverBackgroundColour: darken(0.05, '#FF0080'),
      },
      subtle: {
        backgroundColour: 'rgba(255,255,255, 0)',
        colour: '#333333',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(255,255,255, 0.01)',
      },
      subtleInvert: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.05)',
      },
      disabled: {
        backgroundColour: '#e0e0e0',
        colour: darken(0.4, '#e0e0e0'),
        borderColour: 'transparent',
        hoverBackgroundColour: '#e0e0e0',
      },
    },
    colours: {
      textColour: '#333333',
      altTextColour: '#EEEEEE',
      disabledTextColour: lighten(0.35, '#333333'),
      primaryColour: '#2FB1ED',
      secondaryColour: '#43EFB3',
      tertiaryColour: '#FF0080',
      quarternaryColour: '#EFB343',
      penternaryColour: '#CF43EF',
      backgroundColour: '#F9F9F9',
      borderColour: '#e0e0e0',
      altBorderColour: '#404040',
      altBackgroundColour: '#404040',
      dialogBackgroundColour: '#F5F5F5',
      focusDialogBackgroundColour: darken(0.05, '#F5F5F5'),
      altDialogBackgroundColour: '#404040',
      focusAltDialogBackgroundColour: lighten(0.05, '#404040'),
      focusBackgroundColour: darken(0.08, '#FEFEFE'), // TODO: How to get it to refer to backgroundColour
      focusBorderColour: lighten(0.08, '#e0e0e0'), // TODO: How to get it to refer to backgroundColour
      okColour: '#43EFB3',
      neutralColour: '#2FB1ED',
      errorColour: '#FF0080',
      errorBackgroundColour: lighten(0.3, '#FF0080'),
      staleBackgroundColour: lighten(0.3, '#CF43EF'),
      warningColour: '#EFB343',
      iconColour: '#333333',
      altIconColour: '#F9F9F9',
      headerBackgroundColour: '#404040',
      headerTextColour: '#F9F9F9',
    },
  },
  dark: {
    name: 'Dark',
    font: {
      sansSerif: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;
    },
    fontSizes: {
      xxxsmall: '10px',
      xxsmall: '11px',
      xsmall: '12px',
      small: '13px',
      regular: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '26px',
      xxxlarge: '34px',
    },
    fontWeights: {
      thin: 100,
      regular: 300,
      bold: 500,
      xbold: 700,
    },
    button: {
      default: {
        backgroundColour: '#404040',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.05, '#404040'),
      },
      invert: {
        backgroundColour: '#404040',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.05, '#404040'),
      },

      primary: {
        backgroundColour: '#2FB1ED',
        colour: '#EEEEEE',
        borderColour: '#2FB1ED',
        hoverBackgroundColour: darken(0.05, '#2FB1ED'),
      },
      error: {
        backgroundColour: '#FF0080',
        colour: '#EEEEEE',
        borderColour: '#FF0080',
        hoverBackgroundColour: darken(0.05, '#FF0080'),
      },
      subtle: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
      },
      subtleInvert: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
      },
      disabled: {
        backgroundColour: lighten(0.1, '#404040'),
        colour: lighten(0.4, '#404040'),
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.1, '#404040'),
      },
    },
    colours: {
      textColour: '#EEEEEE',
      altTextColour: '#EEEEEE',
      disabledTextColour: darken(0.25, '#EEEEEE'),
      primaryColour: '#2FB1ED',
      secondaryColour: '#43EFB3',
      tertiaryColour: '#FF0080',
      quarternaryColour: '#EFB343',
      penternaryColour: '#CF43EF',
      backgroundColour: '#404040',
      borderColour: '#909090',
      altBorderColour: '#EEEEEE',
      altBackgroundColour: '#404040',
      dialogBackgroundColour: '#404040',
      focusDialogBackgroundColour: darken(0.05, '#404040'),
      altDialogBackgroundColour: '#404040',
      focusAltDialogBackgroundColour: darken(0.05, '#404040'),
      focusBackgroundColour: darken(0.05, '#404040'), // TODO: How to get it to refer to backgroundColour
      focusBorderColour: darken(0.05, '#909090'), // TODO: How to get it to refer to backgroundColour
      okColour: '#43EFB3',
      neutralColour: '#2FB1ED',
      errorColour: '#FF0080',
      errorBackgroundColour: '#404040',
      staleBackgroundColour: darken(0.3, '#CF43EF'),
      warningColour: '#EFB343',
      iconColour: '#333333',
      altIconColour: '#CCCCCC',
      headerBackgroundColour: darken(0.05, '#404040'),
      headerTextColour: '#F9F9F9',
    },
  },
}
