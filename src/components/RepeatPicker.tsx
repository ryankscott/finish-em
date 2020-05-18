import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import {
    SelectContainer,
    DisabledContainer,
    DisabledText,
} from './styled/RepeatPicker'
import DateRenderer from './DateRenderer'
import { repeatIcon } from '../assets/icons'
import { IconContainer } from './styled/DatePicker'

const options = [
    {
        value: new RRule({
            freq: RRule.DAILY,
            interval: 1,
        }),
        label: 'Daily',
    },
    {
        value: new RRule({
            freq: RRule.DAILY,
            interval: 1,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
        }),
        label: 'Weekdays',
    },
    {
        value: new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: new Date().getDay() - 1,
        }),
        label: 'Weekly on ' + format(new Date(), 'EEE'),
    },
    {
        value: new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            bymonthday: new Date().getDate(),
        }),
        label: 'Monthly on the ' + format(new Date(), 'do'),
    },

    { value: null, label: 'None' },
]

interface RepeatPickerProps {
    onSubmit: (value: RRule) => void
    onEscape?: () => void
    showSelect?: boolean
    text: string
    placeholder: string
    completed: boolean
    style?: 'default' | 'subtle' | 'subtleInvert'
    disableClick?: boolean
}

function RepeatPicker(props: RepeatPickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }

    const generateDisabledElement = (
        text: string,
        completed: boolean,
    ): ReactElement => {
        return (
            <DisabledContainer completed={completed}>
                <IconContainer>{repeatIcon(12, 12)}</IconContainer>
                <DisabledText>{text}</DisabledText>
            </DisabledContainer>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <div>
                {props.disableClick ? (
                    generateDisabledElement(props.text, props.completed)
                ) : (
                    <DateRenderer
                        completed={props.completed}
                        type="repeat"
                        position="center"
                        style={props.style}
                        text={props.text}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (props.completed) return
                            setShowSelect(!showSelect)
                        }}
                    />
                )}

                {(showSelect || props.showSelect) && (
                    <SelectContainer>
                        <Select
                            autoFocus={true}
                            placeholder={props.placeholder}
                            onChange={handleChange}
                            options={options}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    setShowSelect(false)
                                }
                            }}
                            styles={selectStyles}
                            defaultMenuIsOpen={true}
                        />
                    </SelectContainer>
                )}
            </div>
        </ThemeProvider>
    )
}

export default RepeatPicker
