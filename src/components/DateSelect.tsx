import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { add, lastDayOfWeek } from 'date-fns'
import './DatePicker.css'
import DayPicker from 'react-day-picker/DayPicker'

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

export interface DateSelectProps {
    autoFocus?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    icon?: 'due' | 'scheduled'
    onSubmit: (d: string) => void
    onEscape?: () => void
    placeholder: string
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    zIndex?: number
}

function DateSelect(props: DateSelectProps): ReactElement {
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
        return
    }

    const handleDayClick = (day): void => {
        setDayPickerVisible(false)
        props.onSubmit(day.toISOString())
        return
    }

    return (
        <ThemeProvider theme={theme}>
            <Select
                isDisabled={
                    props.disabled != undefined ? props.disabled : false
                }
                autoFocus={
                    props.autoFocus != undefined ? props.autoFocus : true
                }
                placeholder={props.placeholder}
                onChange={handleChange}
                options={options}
                styles={selectStyles({
                    fontSize: props.textSize || 'xxsmall',
                    zIndex: props.zIndex,
                })}
                defaultMenuIsOpen={
                    props.defaultOpen != undefined ? props.defaultOpen : true
                }
                escapeClearsValue={true}
                tabIndex="0"
                onKeyDown={(e) => {
                    if (e.key == 'Escape' && props.onEscape) {
                        props.onEscape()
                    }
                }}
            />
            {dayPickerVisible && (
                <div style={{ zIndex: props.zIndex }}>
                    <DayPicker
                        autoFocus
                        tabIndex={0}
                        onDayClick={handleDayClick}
                    />
                </div>
            )}
        </ThemeProvider>
    )
}

export default DateSelect