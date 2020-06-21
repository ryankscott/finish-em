import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import { IconType } from '../interfaces'
import { connect } from 'react-redux'
import { Icons } from '../assets/icons'

interface StateProps {
    theme: string
}
interface OwnProps {
    id?: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    spacing?: 'compact' | 'default'
    type: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert'
    text?: string | JSX.Element
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    iconSize?: string
    iconColour?: string
    tabIndex?: number
    dataFor?: string
    width?: string
    height?: string
    iconPosition?: 'before' | 'after'
    icon?: IconType
    rotate?: number // Note: This lovely little hack is because of a StyledComponents bug https://github.com/styled-components/styled-components/issues/1198
    translateY?: number
    translateZ?: number
}

type ButtonProps = OwnProps & StateProps

// TODO: Add tooltips to the button?
const Button = (props: ButtonProps): ReactElement => {
    const theme = themes[props.theme].button[props.type]
    return (
        <ThemeProvider theme={theme}>
            <StyledButton
                id={props.id}
                spacing={props.spacing}
                height={props.height}
                width={props.width}
                onClick={props.onClick}
                data-tip
                data-for={props.dataFor}
                tabIndex={props.tabIndex != undefined ? props.tabIndex : -1}
                iconOnly={props.icon && !props.text}
            >
                <Contents>
                    {props.icon && !(props.iconPosition == 'after') && (
                        <Icon
                            iconPosition={props.iconPosition}
                            rotate={props.rotate != undefined ? props.rotate : 0}
                            translateY={props.translateY != undefined ? props.translateY : 0}
                            translateZ={props.translateZ != undefined ? props.translateZ : 0}
                        >
                            {Icons[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                                props.iconColour || null,
                            )}
                        </Icon>
                    )}
                    {props.text && (
                        <Text textSize={props.textSize} hasIcon={props.icon != undefined}>
                            {props.text}
                        </Text>
                    )}
                    {props.icon && props.iconPosition == 'after' && (
                        <Icon iconPosition={props.iconPosition}>
                            {Icons[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                                props.iconColour || null,
                            )}
                        </Icon>
                    )}
                </Contents>
            </StyledButton>
        </ThemeProvider>
    )
}
const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Button)
