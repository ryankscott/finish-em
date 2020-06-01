import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import * as ic from '../assets/icons'
import { IconType } from '../interfaces'
import { connect } from 'react-redux'

const iconMapping = {
    close: (w, h, c) => ic.closeIcon(w, h, c),
    expand: (w, h, c) => ic.expandedIcon(w, h, c),
    collapse: (w, h, c) => ic.collapsedIcon(w, h, c),
    help: (w, h, c) => ic.helpIcon(w, h, c),
    repeat: (w, h, c) => ic.repeatIcon(w, h, c),
    due: (w, h, c) => ic.dueIcon(w, h, c),
    scheduled: (w, h, c) => ic.scheduledIcon(w, h, c),
    note: (w, h, c) => ic.noteIcon(w, h, c),
    add: (w, h, c) => ic.addIcon(w, h, c),
    todoUnchecked: (w, h, c) => ic.todoUncheckedIcon(w, h, c),
    todoChecked: (w, h, c) => ic.todoCheckedIcon(w, h, c),
    trash: (w, h, c) => ic.trashIcon(w, h, c),
    trashSweep: (w, h, c) => ic.trashSweepIcon(w, h, c),
    hide: (w, h, c) => ic.hideIcon(w, h, c),
    show: (w, h, c) => ic.showIcon(w, h, c),
    sort: (w, h, c) => ic.sortIcon(w, h, c),
    inbox: (w, h, c) => ic.inboxIcon(w, h, c),
    calendar: (w, h, c) => ic.calendarIcon(w, h, c),
    slideLeft: (w, h, c) => ic.slideLeftIcon(w, h, c),
    slideRight: (w, h, c) => ic.slideRightIcon(w, h, c),
    upLevel: (w, h, c) => ic.upLevelIcon(w, h, c),
    back: (w, h, c) => ic.backIcon(w, h, c),
    forward: (w, h, c) => ic.forwardIcon(w, h, c),
    settings: (w, h, c) => ic.settingsIcon(w, h, c),
    subtask: (w, h, c) => ic.subtaskIcon(w, h, c),
    more: (w, h, c) => ic.moreIcon(w, h, c),
    flag: (w, h, c) => ic.flagIcon(w, h, c),
    trashPermanent: (w, h, c) => ic.trashPermanentIcon(w, h, c),
    stale: (w, h, c) => ic.staleIcon(w, h, c),
    label: (w, h, c) => ic.labelIcon(w, h, c),
}

interface StateProps {
    theme: string
}
interface OwnProps {
    id?: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
    spacing?: 'compact' | 'default'
    type: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert'
    text?: string
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
    translate?: number
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
                            rotate={
                                props.rotate != undefined ? props.rotate : 0
                            }
                        >
                            {iconMapping[props.icon](
                                props.iconSize || null,
                                props.iconSize || null,
                                props.iconColour || null,
                            )}
                        </Icon>
                    )}
                    {props.text && (
                        <Text
                            textSize={props.textSize}
                            hasIcon={props.icon != undefined}
                        >
                            {props.text}
                        </Text>
                    )}
                    {props.icon && props.iconPosition == 'after' && (
                        <Icon iconPosition={props.iconPosition}>
                            {iconMapping[props.icon](
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
