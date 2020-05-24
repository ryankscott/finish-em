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
import RepeatDialog from './RepeatDialog'
import { rruleToText, capitaliseFirstLetter } from '../utils'
import { Tooltip } from './Tooltip'

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
    { value: null, label: 'Custom repeat' },
    { value: null, label: 'None' },
]

interface RepeatPickerProps {
    id: string
    repeat: RRule
    onSubmit: (value: RRule) => void
    onEscape?: () => void
    showSelect?: boolean
    placeholder: string
    completed: boolean
    style?: 'default' | 'subtle' | 'subtleInvert'
    disableClick?: boolean
}

function RepeatPicker(props: RepeatPickerProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            if (newValue.label == 'Custom repeat') {
                setRepeatDialogVisible(true)
                return
            }
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }

    const generateDisabledElement = (
        id: string,
        shortText: string,
        longText: string,
        completed: boolean,
    ): ReactElement => {
        return (
            <>
                <DisabledContainer
                    data-for={'disabled-repeat-' + id}
                    data-tip
                    completed={completed}
                >
                    <IconContainer>{repeatIcon(12, 12)}</IconContainer>
                    <DisabledText>{shortText}</DisabledText>
                </DisabledContainer>
                <Tooltip id={'disabled-repeat-' + id} text={longText} />
            </>
        )
    }
    const repeatText = props.repeat
        ? capitaliseFirstLetter(rruleToText(props.repeat))
        : ''
    const repeatLongText = props.repeat
        ? capitaliseFirstLetter(props.repeat.toText())
        : ''
    return (
        <ThemeProvider theme={theme}>
            <div>
                {props.disableClick ? (
                    generateDisabledElement(
                        props.id,
                        repeatText,
                        repeatLongText,
                        props.completed,
                    )
                ) : (
                    <DateRenderer
                        tooltipText={repeatLongText}
                        completed={props.completed}
                        icon="repeat"
                        position="center"
                        style={props.style}
                        text={repeatText}
                        onClick={(e) => {
                            e.stopPropagation()
                            if (props.completed) return
                            setShowSelect(!showSelect)
                        }}
                    />
                )}

                {(showSelect || props.showSelect) && (
                    <>
                        <SelectContainer>
                            <Select
                                autoFocus={true}
                                placeholder={props.placeholder}
                                onChange={handleChange}
                                options={options}
                                tabIndex="0"
                                defaultMenuIsOpen={true}
                                escapeClearsValue={true}
                                onKeyDown={(e) => {
                                    if (e.key == 'Escape') {
                                        setShowSelect(false)
                                        if (props.onEscape) {
                                            props.onEscape()
                                        }
                                    }
                                }}
                                styles={selectStyles({
                                    fontSize: 'xxsmall',
                                    minWidth: '140px',
                                })}
                            />
                            {repeatDialogVisible && (
                                <RepeatDialog
                                    onSubmit={(r) => {
                                        props.onSubmit(r)
                                        setRepeatDialogVisible(false)
                                        setShowSelect(false)
                                    }}
                                ></RepeatDialog>
                            )}
                        </SelectContainer>
                    </>
                )}
            </div>
        </ThemeProvider>
    )
}

export default RepeatPicker
