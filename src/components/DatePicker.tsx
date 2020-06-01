import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import {
    IconContainer,
    DisabledContainer,
    DisabledText,
    Container,
    SelectContainer,
} from './styled/DatePicker'
import DateRenderer from './DateRenderer'
import { dueIcon, scheduledIcon } from '../assets/icons'
import DateSelect from './DateSelect'
import { IconType } from '../interfaces'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}
interface OwnProps {
    onSubmit: (d: string) => void
    onEscape?: () => void
    style?: 'default' | 'subtle' | 'subtleInvert'
    showSelect?: boolean
    disableClick?: boolean
    placeholder: string
    completed: boolean
    text: string
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    icon?: IconType
    zIndex?: number
}

type DatePickerProps = StateProps & OwnProps

function DatePicker(props: DatePickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)

    const generateDisabledElement = (
        text: string,
        completed: boolean,
        type: IconType,
    ): ReactElement => {
        let icon = null
        switch (type) {
            case 'due':
                icon = dueIcon(14, 14)
                break

            case 'scheduled':
                icon = scheduledIcon(14, 14)
                break

            default:
                icon = null
                break
        }

        return (
            <DisabledContainer completed={completed}>
                <IconContainer> {icon}</IconContainer>
                <DisabledText>{text}</DisabledText>
            </DisabledContainer>
        )
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                {props.disableClick ? (
                    generateDisabledElement(
                        props.text,
                        props.completed,
                        props.icon,
                    )
                ) : (
                    <DateRenderer
                        style={props.style}
                        completed={props.completed}
                        textSize={props.textSize}
                        icon={props.icon}
                        position="center"
                        text={props.text}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (props.completed) return
                            setShowSelect(!showSelect)
                        }}
                    />
                )}
                {(props.showSelect || showSelect) && (
                    <SelectContainer>
                        <DateSelect
                            placeholder={props.placeholder}
                            onEscape={() => {
                                setShowSelect(false)
                                if (props.onEscape) {
                                    props.onEscape()
                                }
                            }}
                            onSubmit={(d) => {
                                setShowSelect(false)
                                props.onSubmit(d)
                            }}
                            textSize={props.textSize}
                            zIndex={props.zIndex}
                        ></DateSelect>
                    </SelectContainer>
                )}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DatePicker)
