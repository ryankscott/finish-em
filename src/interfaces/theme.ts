import CSS from 'csstype'
export type ThemeType = {
    name: string
    font: {
        sansSerif: CSS.FontFamilyProperty
    }
    fontSizes: {
        xxxsmall: CSS.Properties['fontSize']
        xxsmall: CSS.Properties['fontSize']
        xsmall: CSS.Properties['fontSize']
        small: CSS.Properties['fontSize']
        regular: CSS.Properties['fontSize']
        large: CSS.Properties['fontSize']
        xlarge: CSS.Properties['fontSize']
        xxlarge: CSS.Properties['fontSize']
        xxxlarge: CSS.Properties['fontSize']
    }
    fontWeights: {
        thin: number
        regular: number
        bold: number
        xbold: number
    }
    button: {
        default: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        invert: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        primary: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        error: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        subtle: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        subtleInvert: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
    }
    colours: {
        textColour: CSS.Color
        disabledTextColour: CSS.Color
        altTextColour: CSS.Color
        primaryColour: CSS.Color
        secondaryColour: CSS.Color
        tertiaryColour: CSS.Color
        quarternaryColour: CSS.Color
        penternaryColour: CSS.Color
        backgroundColour: CSS.Color
        borderColour: CSS.Color
        altBorderColour: CSS.Color
        altBackgroundColour: CSS.Color
        dialogBackgroundColour: CSS.Color
        focusDialogBackgroundColour: CSS.Color
        altDialogBackgroundColour: CSS.Color
        focusAltDialogBackgroundColour: CSS.Color
        focusBackgroundColour: CSS.Color
        focusBorderColour: CSS.Color
        okColour: CSS.Color
        neutralColour: CSS.Color
        errorColour: CSS.Color
        errorBackgroundColour: CSS.Color
        staleBackgroundColour: CSS.Color
        warningColour: CSS.Color
        iconColour: CSS.Color
        altIconColour: CSS.Color
        disabledButtonBackgroundColour: CSS.Color
        disabledButtonColour: CSS.Color
        headerBackgroundColour: CSS.Color
        headerTextColour: CSS.Color
    }
}

export type fontSizeType =
    | 'xxxsmall'
    | 'xxsmall'
    | 'xsmall'
    | 'small'
    | 'regular'
    | 'large'
    | 'xlarge'
    | 'xxlarge'
    | 'xxxlarge'

export type fontWeightType = 'thin' | 'regular' | 'bold' | 'xbold'
