import { lighten, darken } from 'polished'
import CSS from 'csstype'

export const theme = {
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
            backgroundColour: '#Fbfbfb',
            colour: '#333333',
            borderColour: '#e0e0e0',
            hoverBackgroundColour: darken(0.05, '#Fbfbfb'),
        },
        invert: {
            backgroundColour: '#404040',
            colour: '#Fbfbfb',
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
            backgroundColour: 'rgba(255,255,255, 0.01)',
            colour: '#EEEEEE',
            borderColour: '#e0e0e0',
            hoverBackgroundColour: 'rgba(255,255,255, 0.01)',
        },
        subtleInvert: {
            backgroundColour: 'rgba(0,0,0, 0.01)',
            colour: '#333333',
            borderColour: 'none',
            hoverBackgroundColour: 'rgba(0,0,0, 0.05)',
        },
    },
    colours: {
        defaultTextColour: '#333333',
        disabledTextColour: lighten(0.35, '#333333'),
        altTextColour: '#EEEEEE',
        primaryColour: '#45b9ef',
        secondaryColour: '#59cd90',
        tertiaryColour: '#fe5e41',
        quarternaryColour: '#f9df77',
        penternaryColour: '#511a37',
        backgroundColour: '#Fbfbfb',
        borderColour: '#e0e0e0',
        altBackgroundColour: '#404040',
        lightDialogBackgroundColour: '#F0f0f0',
        focusLightDialogBackgroundColour: darken(0.05, '#F0f0f0'),
        darkDialogBackgroundColour: '#404040',
        focusDarkDialogBackgroundColour: lighten(0.05, '#404040'),
        focusBackgroundColour: darken(0.05, '#FEFEFE'), // TODO: How to get it to refer to backgroundColour
        focusBorderColour: lighten(0.05, '#e0e0e0'), // TODO: How to get it to refer to backgroundColour
        okColour: '#59cd90',
        neutralColour: '#45b9ef',
        errorColour: '#fe5e41',
        errorBackgroundColour: lighten(0.3, '#fe5e41'),
        warningColour: '#f9df77',
        defaultIconColour: '#333333',
        lightIconColour: '#CCCCCC',
    },
}

export const sortPlaceholderStyles = (base, state) => ({
    ...base,
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'space-between',
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    color: theme.colours.defaultTextColour,
    border: '0px',
})

export const sortControlStyles = (base, state) => ({
    ...base,
    width: '100%',
    margin: 0,
    padding: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    backgroundColor: state.isFocused
        ? theme.button.default.hoverBackgroundColour
        : theme.colours.backgroundColour,
    border: '0px',
    borderRadius: '5px',
    boxShadow: 'none',
    zIndex: 2,
    '&:hover': {
        backgroundColor: theme.button.default.hoverBackgroundColour,
    },
})

interface SelectStylesProps {
    fontSize: 'xxsmall' | 'xxxsmall'
    minWidth?: CSS.MinWidthProperty<number>
    maxHeight?: CSS.MaxHeightProperty<number>
    width?: CSS.WidthProperty<number>
    zIndex?: number
}
export const selectStyles = (props: SelectStylesProps) => {
    return {
        container: () => ({
            zIndex: props.zIndex != undefined ? props.zIndex : 1,
            padding: '0px 0px',
            width: props.width || 'auto',
            minWidth: props.minWidth || '120px',
            maxHeight: props.maxHeight || '180px',
        }),
        input: () => ({
            padding: '5px 2px',
            fontFamily: theme.font.sansSerif,
            color: theme.colours.defaultTextColour,
            fontSize: theme.fontSizes[props.fontSize],
            zIndex: props.zIndex != undefined ? props.zIndex : 1,
        }),
        menu: () => ({
            margin: '0px 0px',
            padding: '5px 0px',
            border: '1px solid',
            backgroundColor: theme.colours.backgroundColour,
            borderColor: theme.colours.borderColour,
            borderRadius: '5px',
            tabIndex: 0,
            zIndex: props.zIndex != undefined ? props.zIndex + 1 : 2,
        }),
        option: (provided, state) => ({
            ...provided,
            tabIndex: 0,
            color: theme.colours.defaultTextColour,
            backgroundColor: state.isFocused
                ? theme.colours.focusBackgroundColour
                : theme.colours.backgroundColour,
            padding: '5px 10px',
            margin: '0px',
            fontFamily: theme.font.sansSerif,
            fontSize: theme.fontSizes[props.fontSize],
            fontWeight: state.isFocused
                ? theme.fontWeights.bold
                : theme.fontWeights.regular,
            zIndex: props.zIndex != undefined ? props.zIndex + 1 : 2,
        }),
        placeholder: () => ({
            color: theme.colours.defaultTextColour,
            fontSize: theme.fontSizes[props.fontSize],
        }),
        control: () => ({
            width: '100%',
            margin: 0,
            padding: 0,
            fontFamily: theme.font.sansSerif,
            fontSize: theme.fontSizes[props.fontSize],
            backgroundColor: theme.colours.backgroundColour,
            border: '1px solid',
            borderColor: theme.colours.borderColour,
            borderRadius: '5px',
            zIndex: props.zIndex != undefined ? props.zIndex : 1,
            '&:hover': {
                backgroundColor: theme.button.default.hoverBackgroundColour,
            },
        }),
        singleValue: () => ({}),
        indicatorsContainer: () => ({}),
        dropdownIndicator: () => ({ display: 'none' }),
        noOptionsMessage: () => ({
            fontFamily: theme.font.sansSerif,
            fontSize: theme.fontSizes[props.fontSize],
            fontWeight: theme.fontWeights.thin,
            padding: '2px 5px',
        }),
    }
}
