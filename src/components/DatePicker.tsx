import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { add, lastDayOfWeek } from 'date-fns'
import './DatePicker.css'
import DayPicker from 'react-day-picker/DayPicker'
import { Container } from './styled/DatePicker'

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
    placeholder: string
}

function DatePicker(props: DatePickerProps): ReactElement {
    const [dayPickerVisible, setDayPickerVisible] = useState(false)

    const handleChange = (newValue, actionMeta): void => {
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

    const handleDayClick = (day, modifiers, e): void => {
        setDayPickerVisible(false)
        props.onSubmit(day.toISOString())
        return
    }

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Select
                    autoFocus={true}
                    placeholder={props.placeholder}
                    onChange={handleChange}
                    options={options}
                    styles={selectStyles}
                    escapeClearsValue={true}
                    defaultMenuIsOpen={true}
                    tabIndex="0"
                    onKeyDown={(e) => {
                        if (e.key == 'Escape') {
                            props.onEscape()
                        }
                    }}
                />
                {dayPickerVisible && (
                    <DayPicker tabIndex={0} onDayClick={handleDayClick} />
                )}
            </Container>
        </ThemeProvider>
    )
}

export default DatePicker
