import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { add, lastDayOfWeek } from 'date-fns'
import './DatePicker.css'
import DayPicker from 'react-day-picker/DayPicker'
import {
    SelectContainer,
    IconContainer,
    DisabledContainer,
    DisabledText,
} from './styled/DatePicker'
import DateRenderer from './DateRenderer'
import { dueIcon, scheduledIcon } from '../assets/icons'

const options: { value: string; label: string }[] = [
    { value: new Date().toISOString(), label: 'Today' },
    {
        value: add(new Date(), { days: 1 }).toISOString(),
        label: 'Tomorrow',
    },
    {
        value: add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
            days: 1,
        }).toISOString(),
        label: 'Next Week',
    },
    {
        value: null,
        label: 'Custom date',
    },
    { value: null, label: 'No date' },
]

export interface DatePickerProps {
    onSubmit: (d: string) => void
    onEscape?: () => void
    style?: 'default' | 'subtle' | 'subtleInvert'
    showSelect?: boolean
    disableClick?: boolean
    placeholder: string
    completed: boolean
    text: string
    type: 'due' | 'scheduled'
}

function DatePicker(props: DatePickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const [dayPickerVisible, setDayPickerVisible] = useState(false)

    const handleChange = (newValue, actionMeta): void => {
        setDayPickerVisible(false)
        if (actionMeta.action == 'select-option') {
            // if it's a custom date then show the calendar item
            if (newValue.label == 'Custom date') {
                setDayPickerVisible(true)
                return
            }
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }

    const handleDayClick = (day): void => {
        setDayPickerVisible(false)
        props.onSubmit(day.toISOString())
        setShowSelect(false)
        return
    }
    const generateDisabledElement = (
        text: string,
        completed: boolean,
        type: 'due' | 'scheduled',
    ): ReactElement => {
        return (
            <DisabledContainer completed={completed}>
                <IconContainer>
                    {type == 'due' ? dueIcon(14, 14) : scheduledIcon(14, 14)}
                </IconContainer>
                <DisabledText>{text}</DisabledText>
            </DisabledContainer>
        )
    }

    return (
        <ThemeProvider theme={theme}>
            <div>
                {props.disableClick ? (
                    generateDisabledElement(
                        props.text,
                        props.completed,
                        props.type,
                    )
                ) : (
                    <DateRenderer
                        style={props.style}
                        completed={props.completed}
                        type={props.type}
                        position="center"
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
                            styles={selectStyles}
                            defaultMenuIsOpen={true}
                            escapeClearsValue={true}
                            tabIndex="0"
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    if (props.onEscape) {
                                        props.onEscape()
                                    }
                                }
                            }}
                        />
                        {dayPickerVisible && (
                            <DayPicker
                                autoFocus
                                tabIndex={0}
                                onDayClick={handleDayClick}
                            />
                        )}
                    </SelectContainer>
                )}
            </div>
        </ThemeProvider>
    )
}

export default DatePicker
