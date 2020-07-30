import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import Select from 'react-select'
import { themes, selectStyles } from '../theme'
import { add, sub, lastDayOfWeek } from 'date-fns'
import './DatePicker.css'
import DayPicker from 'react-day-picker/DayPicker'
import { connect } from 'react-redux'

const options: { value: () => string; label: string }[] = [
    { value: () => new Date().toISOString(), label: 'Today' },
    {
        value: () => add(new Date(), { days: 1 }).toISOString(),
        label: 'Tomorrow',
    },
    {
        value: () =>
            sub(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
                days: 2,
            }).toISOString(),
        label: 'End of Week',
    },
    {
        value: () =>
            add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
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

interface StateProps {
    theme: string
}

interface OwnProps {
    autoFocus?: boolean
    defaultOpen?: boolean
    disabled?: boolean
    icon?: 'due' | 'scheduled'
    onSubmit: (d: string) => void
    onEscape?: () => void
    placeholder: string
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
}

type DateSelectProps = OwnProps & StateProps

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
            props.onSubmit(newValue.value ? newValue.value() : null)
        }
        return
    }

    const handleDayClick = (day): void => {
        setDayPickerVisible(false)
        props.onSubmit(day.toISOString())
        return
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Select
                isDisabled={props.disabled != undefined ? props.disabled : false}
                autoFocus={props.autoFocus != undefined ? props.autoFocus : true}
                placeholder={props.placeholder}
                onChange={handleChange}
                options={options}
                styles={selectStyles({
                    fontSize: props.textSize || 'xxsmall',
                    theme: themes[props.theme],
                })}
                defaultMenuIsOpen={props.defaultOpen != undefined ? props.defaultOpen : true}
                escapeClearsValue={true}
                tabIndex="0"
                onKeyDown={(e) => {
                    if (e.key == 'Escape' && props.onEscape) {
                        props.onEscape()
                    }
                }}
            />
            {dayPickerVisible && (
                <div>
                    <DayPicker tabIndex={0} onDayClick={handleDayClick} />
                </div>
            )}
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DateSelect)
