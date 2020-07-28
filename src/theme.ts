import { lighten, darken, readableColor } from 'polished'
import CSS from 'csstype'
import { ThemeType, fontSizeType } from './interfaces'
import { StylesConfig } from 'react-select'
import { createGlobalStyle } from './StyledComponents'

export const GlobalStyle = createGlobalStyle`
* {
    box-sizing: border-box;
}
  html {
    box-sizing: border-box;
  }
  body {
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => props.theme.colours.backgroundColour}
    font-weight: ${(props) => props.theme.fontWeights.regular};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }
  h1 {
    font-size: ${(props) => props.theme.fontSizes.xlarge};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.primaryColour};
    padding-top: 20px;
  }
  h1 p {
    font-size: ${(props) => props.theme.fontSizes.xlarge};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.primaryColour};
    padding-top: 20px;
  }
  h2 {
    font-size: ${(props) => props.theme.fontSizes.large};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.textColour};
    padding-top: 15px;
    margin: 10px 0px;
  }
  h3 {
    font-size: ${(props) => props.theme.fontSizes.small};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.textColour};
    padding-top: 0px;
    margin: 0px 5px 5px 5px;
  }
p {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    margin: 2px 5px;
}
code {
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    padding: 2px 5px;
    margin: 2px 5px;
}
ul {
    margin: 2px;
}

li {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    margin: 2px;
    padding: 2px;
}
table {
    padding: 5px;
    padding-bottom: 20px;
    max-width: 600px;
    width: 100%;
}
thead {
}
tbody {
    tr:first-child {
        td {
            padding-top: 5px;
        }
    }
}

td {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    padding: 2px 5px;
}


th {
    font-weight: ${(props) => props.theme.fontWeights.bold}
    font-size: ${(props) => props.theme.fontSizes.small};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    border-bottom: 1px solid;
    padding: 5px 2px;
    margin: 5px 2px;
    border-color: ${(props) => props.theme.colours.borderColour};
}
  *:focus {outline:0;}
  a {
      color: ${(props) => props.theme.colours.textColour};
  }
`

export const themes: { [key: string]: ThemeType } = {
    light: {
        name: 'Light',
        font: {
            sansSerif: '-apple-system, BlinkMacSystemFont, Helvetica, sans-serif',
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
                backgroundColour: '#F5f5f5',
                colour: '#333333',
                borderColour: 'transparent',
                hoverBackgroundColour: darken(0.05, '#F5f5f5'),
            },
            invert: {
                backgroundColour: '#404040',
                colour: '#F5f5f5',
                borderColour: 'transparent',
                hoverBackgroundColour: lighten(0.1, '#404040'),
            },
            primary: {
                backgroundColour: '#45b9ef',
                colour: '#EEEEEE',
                borderColour: '#45b9ef',
                hoverBackgroundColour: darken(0.05, '#45b9ef'),
            },
            error: {
                backgroundColour: '#fe5e41',
                colour: '#EEEEEE',
                borderColour: '#fe5e41',
                hoverBackgroundColour: darken(0.05, '#fe5e41'),
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
        },
        colours: {
            textColour: '#333333',
            altTextColour: '#EEEEEE',
            disabledTextColour: lighten(0.35, '#333333'),
            primaryColour: '#45b9ef',
            secondaryColour: '#59cd90',
            tertiaryColour: '#fe5e41',
            quarternaryColour: '#f9df77',
            penternaryColour: '#9B5DE5',
            backgroundColour: '#F5f5f5',
            borderColour: '#e0e0e0',
            altBorderColour: '#404040',
            altBackgroundColour: '#404040',
            dialogBackgroundColour: '#F5F5F5',
            focusDialogBackgroundColour: darken(0.05, '#F5F5F5'),
            altDialogBackgroundColour: '#404040',
            focusAltDialogBackgroundColour: lighten(0.05, '#404040'),
            focusBackgroundColour: darken(0.08, '#FEFEFE'), // TODO: How to get it to refer to backgroundColour
            focusBorderColour: lighten(0.08, '#e0e0e0'), // TODO: How to get it to refer to backgroundColour
            okColour: '#59cd90',
            neutralColour: '#45b9ef',
            errorColour: '#fe5e41',
            errorBackgroundColour: lighten(0.3, '#fe5e41'),
            staleBackgroundColour: lighten(0.3, '#9B5DE5'),
            warningColour: '#f9df77',
            iconColour: '#333333',
            altIconColour: '#404040',
            disabledButtonBackgroundColour: '#e0e0e0',
            disabledButtonColour: darken(0.4, '#e0e0e0'),
            headerBackgroundColour: '#404040',
            headerTextColour: '#F5f5f5',
        },
    },
    dark: {
        name: 'Dark',
        font: {
            sansSerif: '-apple-system, BlinkMacSystemFont, Helvetica, sans-serif',
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
                hoverBackgroundColour: darken(0.1, '#404040'),
            },
            invert: {
                backgroundColour: '#404040',
                colour: '#EEEEEE',
                borderColour: 'transparent',
                hoverBackgroundColour: darken(0.1, '#404040'),
            },

            primary: {
                backgroundColour: '#45b9ef',
                colour: '#EEEEEE',
                borderColour: '#45b9ef',
                hoverBackgroundColour: darken(0.05, '#45b9ef'),
            },
            error: {
                backgroundColour: '#fe5e41',
                colour: '#EEEEEE',
                borderColour: '#fe5e41',
                hoverBackgroundColour: darken(0.05, '#fe5e41'),
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
        },
        colours: {
            textColour: '#EEEEEE',
            altTextColour: '#EEEEEE',
            disabledTextColour: darken(0.25, '#EEEEEE'),
            primaryColour: '#45b9ef',
            secondaryColour: '#59cd90',
            tertiaryColour: '#fe5e41',
            quarternaryColour: '#f9df77',
            penternaryColour: '#9B5DE5',
            backgroundColour: '#404040',
            borderColour: '#909090',
            altBorderColour:'#EEEEEE' 
            altBackgroundColour: '#404040',
            dialogBackgroundColour: '#404040',
            focusDialogBackgroundColour: darken(0.05, '#404040'),
            altDialogBackgroundColour: '#404040',
            focusAltDialogBackgroundColour: darken(0.05, '#404040'),
            focusBackgroundColour: darken(0.05, '#404040'), // TODO: How to get it to refer to backgroundColour
            focusBorderColour: darken(0.05, '#909090'), // TODO: How to get it to refer to backgroundColour
            okColour: '#59cd90',
            neutralColour: '#45b9ef',
            errorColour: '#fe5e41',
            errorBackgroundColour: '#404040',
            staleBackgroundColour: darken(0.3, '#9B5DE5'),
            warningColour: '#f9df77',
            iconColour: '#333333',
            altIconColour: '#CCCCCC',
            disabledButtonBackgroundColour: lighten(0.1, '#404040'),
            disabledButtonColour: lighten(0.4, '#404040'),
            headerBackgroundColour: '#CCCCCC',
            headerTextColour: '#F5f5f5',
        },
    },
}

interface SelectStylesProps {
    fontSize: fontSizeType
    theme: ThemeType
    height?: string
    minWidth?: string
    maxHeight?: string
    width?: string
    showDropdownIndicator?: boolean
    backgroundColour?: CSS.Color
}
export const selectStyles = (props: SelectStylesProps): StylesConfig => {
    return {
        container: (styles) => ({
            ...styles,
            padding: '0px 0px',
            width: props.width || 'auto',
            minWidth: props.minWidth || '120px',
            maxHeight: props.maxHeight || '180px',
            borderColor: `${lighten(0.1, props.theme.colours.borderColour)} !important`,
            '&:active': {
                borderColor: `${lighten(0.1, props.theme.colours.borderColour)} !important`,
            },
            '&:focus': {
                borderColor: `${lighten(0.1, props.theme.colours.borderColour)} !important`,
            },
        }),
        input: (styles) => ({
            ...styles,
            height: props.height ? props.height : 'auto',
            padding: '5px 2px',
            fontFamily: props.theme.font.sansSerif,
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
            fontSize: props.theme.fontSizes[props.fontSize],
            borderColor: `${lighten(0.1, props.theme.colours.borderColour)} !important`,
        }),
        valueContainer: (styles) => ({
            ...styles,
            padding: '0px 5px',
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
        }),
        menu: (styles) => {
            return {
                ...styles,
                margin: '0px 0px',
                padding: '5px 0px',
                border: '1px solid',
                backgroundColor: props.theme.colours.backgroundColour,
                borderColor: lighten(0.1, props.theme.colours.borderColour),
                borderRadius: '5px',
                tabIndex: 0,
                zIndex: 999,
            }
        },
        option: (styles, { data, isFocused }) => {
            return {
                ...styles,

                tabIndex: 0,
                position: 'relative',
                color: props.theme.colours.textColour,
                backgroundColor: isFocused
                    ? darken(0.1, props.theme.colours.backgroundColour)
                    : props.theme.colours.backgroundColour,
                padding: '5px 10px',
                margin: '0px',
                fontFamily: props.theme.font.sansSerif,
                fontSize: props.theme.fontSizes[props.fontSize],
                zIndex: 999,
                fontWeight: isFocused
                    ? props.theme.fontWeights.bold
                    : props.theme.fontWeights.regular,
                '&:active': {
                    backgroundColor: darken(0.1, props.theme.colours.backgroundColour),
                },
                '&:hover': {
                    backgroundColor: darken(0.1, props.theme.colours.backgroundColour),
                },
                '&:focus': {
                    backgroundColor: darken(0.1, props.theme.colours.backgroundColour),
                },
            }
        },
        placeholder: () => ({
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
            fontSize: props.theme.fontSizes[props.fontSize],
        }),
        singleValue: (styles) => ({
            ...styles,
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
        }),
        control: (styles) => ({
            ...styles,
            display: 'flex',
            minHeight: 'none',
            flexDirection: 'row',
            margin: 0,
            padding: 0,
            width: props.width ? props.width : 'auto',
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
            fontFamily: props.theme.font.sansSerif,
            fontSize: props.theme.fontSizes[props.fontSize],
            backgroundColor: props.backgroundColour
                ? props.backgroundColour
                : props.theme.colours.backgroundColour,
            border: '1px solid',
            boxShadow: 'none !important',
            borderColor: `${
                props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : props.theme.colours.borderColour
            } !important`,
            borderRadius: '5px',
            '&:hover': {
                backgroundColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : darken(0.1, props.theme.colours.backgroundColour),

                borderColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : lighten(0.1, props.theme.colours.borderColour),
            },
            '&:active': {
                backgroundColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : darken(0.1, props.theme.colours.backgroundColour),
                borderColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : lighten(0.1, props.theme.colours.borderColour),
                boxShadow: 'none !important',
            },
            '&:focus': {
                backgroundColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : darken(0.1, props.theme.colours.backgroundColour),
                borderColor: props.backgroundColour
                    ? darken(0.1, props.backgroundColour)
                    : lighten(0.1, props.theme.colours.borderColour),
                boxShadow: 'none !important',
            },
        }),
        indicatorsContainer: (styles) => ({
            ...styles,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px 2px',
        }),
        multiValue: (styles) => ({
            ...styles,
            margin: '0px 2px',
        }),
        multiValueLabel: (styles) => ({
            ...styles,
            border: 'none',
            backgroundColor: darken(0.1, props.theme.colours.focusBackgroundColour),
        }),
        multiValueRemove: (styles) => ({
            ...styles,
            color: props.theme.colours.textColour,
            backgroundColor: darken(0.1, props.theme.colours.focusBackgroundColour),
            border: 'none',
            '&:hover': {
                color: props.theme.colours.textColour,
                backgroundColor: darken(0.15, props.theme.colours.focusBackgroundColour),
                cursor: 'pointer',
            },
            '> svg': {
                height: '12px',
                width: '12px',
            },
        }),
        clearIndicator: (styles) => ({
            ...styles,
            color: props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.textColour,
                      props.theme.colours.altTextColour,
                      true,
                  )
                : props.theme.colours.textColour,
            backgroundColor: 'inherit',
            '&:hover': {
                color: props.backgroundColour
                    ? readableColor(
                          props.backgroundColour,
                          props.theme.colours.textColour,
                          props.theme.colours.altTextColour,
                          true,
                      )
                    : props.theme.colours.textColour,
                backgroundColor: 'inherit',
                cursor: 'pointer',
            },
            '> svg': {
                height: '16px',
                width: '16px',
            },
        }),

        indicatorSeparator: () => ({
            display: 'none',
        }),
        dropdownIndicator: () =>
            props.showDropdownIndicator ? { display: 'auto' } : { display: 'none' },
        noOptionsMessage: () => ({
            fontFamily: props.theme.font.sansSerif,
            fontSize: props.theme.fontSizes[props.fontSize],
            fontWeight: props.theme.fontWeights.thin,
            padding: '0px 5px',
        }),
    }
}
