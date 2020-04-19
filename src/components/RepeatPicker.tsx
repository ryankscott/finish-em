import React, { Component, ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import { Container } from './styled/RepeatPicker'

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
        }),
        label: 'Weekly on ' + format(new Date(), 'EEE'),
    },
    {
        value: new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
        }),
        label: 'Monthly on the ' + format(new Date(), 'do'),
    },

    { value: null, label: 'None' },
]

interface RepeatPickerProps {
    onSubmit: (value: RRule) => void
    onEscape?: () => void
    placeholder: string
}

function RepeatPicker(props: RepeatPickerProps): ReactElement { 
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        }
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
                        onKeyDown={(e) => {
                            if (e.key == 'Escape') {
                                props.onEscape()
                            }
                        }}
                        styles={selectStyles}
                        defaultMenuIsOpen={true}
                    />
                </Container>
            </ThemeProvider>
        )
    }
}

export default RepeatPicker
