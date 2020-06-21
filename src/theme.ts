import { lighten, darken, readableColor } from 'polished'
import CSS from 'csstype'
import { ThemeType, fontSizeType } from './interfaces'
import { StylesConfig } from 'react-select'
import { createGlobalStyle } from 'styled-components'

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
    font-weight: ${(props) => props.theme.fontWeights.regular};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    background-color: ${(props) => props.theme.colours.backgroundColour};
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
    margin: 2px 2px;
}
li {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};

}
table {
    padding: 5px;
}
td {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
}
th {
    font-weight: ${(props) => props.theme.fontWeights.bold}
    font-size: ${(props) => props.theme.fontSizes.small};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    border-bottom: 1px solid;
    padding: 2px;
    border-color: ${(props) => props.theme.colours.borderColour}

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
                borderColour: '#e0e0e0',
                hoverBackgroundColour: darken(0.05, '#F5f5f5'),
            },
            invert: {
                backgroundColour: '#404040',
                colour: '#F5f5f5',
                borderColour: '#e0e0e0',
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
                colour: '#EEEEEE',
                borderColour: '#e0e0e0',
                hoverBackgroundColour: 'rgba(255,255,255, 0.01)',
            },
            subtleInvert: {
                backgroundColour: 'rgba(0,0,0,0)',
                colour: '#333333',
                borderColour: 'none',
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
            altBackgroundColour: '#404040',
            dialogBackgroundColour: '#F5F5F5',
            focusDialogBackgroundColour: darken(0.05, '#F5F5F5'),
            altDialogBackgroundColour: '#404040',
            focusAltDialogBackgroundColour: lighten(0.05, '#404040'),
            focusBackgroundColour: darken(0.05, '#FEFEFE'), // TODO: How to get it to refer to backgroundColour
            focusBorderColour: lighten(0.05, '#e0e0e0'), // TODO: How to get it to refer to backgroundColour
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
                borderColour: '#e0e0e0',
                hoverBackgroundColour: darken(0.1, '#404040'),
            },
            invert: {
                backgroundColour: '#404040',
                colour: '#EEEEEE',
                borderColour: '#e0e0e0',
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
                borderColour: 'none',
                hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
            },
            subtleInvert: {
                backgroundColour: 'rgba(0,0,0,0)',
                colour: '#EEEEEE',
                borderColour: '#e0e0e0',
                hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
            },
        },
        colours: {
            textColour: '#EEEEEE',
            altTextColour: '#EEEEEE',
            disabledTextColour: darken(0.35, '#EEEEEE'),
            primaryColour: '#45b9ef',
            secondaryColour: '#59cd90',
            tertiaryColour: '#fe5e41',
            quarternaryColour: '#f9df77',
            penternaryColour: '#9B5DE5',
            backgroundColour: '#404040',
            borderColour: '#909090',
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
        },
    },
}

interface SelectStylesProps {
    fontSize: fontSizeType
    theme: ThemeType
    minWidth?: CSS.MinWidthProperty<number>
    maxHeight?: CSS.MaxHeightProperty<number>
    width?: CSS.WidthProperty<number>
    showDropdownIndicator?: boolean
}
export const selectStyles = (props: SelectStylesProps): StylesConfig => {
    return {
        container: () => ({
            padding: '0px 0px',
            width: props.width || 'auto',
            minWidth: props.minWidth || '120px',
            maxHeight: props.maxHeight || '180px',
            zIndex: 1,
        }),
        input: () => ({
            padding: '5px 2px',
            fontFamily: props.theme.font.sansSerif,
            color: props.theme.colours.textColour,
            fontSize: props.theme.fontSizes[props.fontSize],
        }),
        valueContainer: (base) => ({
            ...base,
            color: props.theme.colours.textColour,
        }),
        menu: () => {
            return {
                margin: '0px 0px',
                padding: '5px 0px',
                border: '1px solid',
                backgroundColor: props.theme.colours.backgroundColour,
                borderColor: props.theme.colours.borderColour,
                borderRadius: '5px',
                tabIndex: 0,
                zIndex: 999,
            }
        },
        option: (styles, { data, isFocused }) => {
            const backgroundColour = data.color
                ? data.color
                : isFocused
                ? props.theme.colours.focusBackgroundColour
                : props.theme.colours.backgroundColour
            return {
                ...styles,
                tabIndex: 0,
                color: readableColor(backgroundColour),
                backgroundColor: backgroundColour,
                padding: '5px 10px',
                margin: '0px',
                fontFamily: props.theme.font.sansSerif,
                fontSize: props.theme.fontSizes[props.fontSize],
                zIndex: 999,
                fontWeight: isFocused
                    ? props.theme.fontWeights.bold
                    : props.theme.fontWeights.regular,
                '&:active': {
                    backgroundColor: props.theme.button.default.hoverBackgroundColour,
                },
            }
        },
        placeholder: () => ({
            color: props.theme.colours.textColour,
            fontSize: props.theme.fontSizes[props.fontSize],
        }),
        singleValue: (base) => ({
            ...base,
            color: props.theme.colours.textColour,
        }),
        control: (base) => ({
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            margin: 0,
            padding: 0,
            color: props.theme.colours.textColour,
            fontFamily: props.theme.font.sansSerif,
            fontSize: props.theme.fontSizes[props.fontSize],
            backgroundColor: props.theme.colours.backgroundColour,
            border: '1px solid',
            borderColor: props.theme.colours.borderColour,
            borderRadius: '5px',
            zIndex: 0,
            '&:hover': {
                backgroundColor: props.theme.button.default.hoverBackgroundColour,
            },
        }),
        indicatorsContainer: () => ({
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingRight: '2px',
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
            padding: '2px 5px',
        }),
    }
}
