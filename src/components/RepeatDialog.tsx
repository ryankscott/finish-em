import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes, selectStyles } from '../theme'
import RRule, { Frequency } from 'rrule'
import Button from './Button'
import DatePicker from './DatePicker'
import { formatRelativeDate } from '../utils'
import { parseISO } from 'date-fns'
import {
    OptionContainer,
    Label,
    StyledSelect,
    Value,
    Container,
    Input,
    ButtonContainer,
} from './styled/RepeatDialog'
import { connect } from 'react-redux'

const frequencyOptions: { value: Frequency; label: string }[] = [
    {
        value: RRule.DAILY,
        label: 'Days',
    },
    {
        value: RRule.WEEKLY,
        label: 'Weeks',
    },
    {
        value: RRule.MONTHLY,
        label: 'Months',
    },
    {
        value: RRule.YEARLY,
        label: 'Years',
    },
]

const endOptions: {}[] = [
    {
        value: 'date',
        label: 'On a date',
    },
    {
        value: 'number_of_times',
        label: 'After X times',
    },
    {
        value: 'never',
        label: 'Never',
    },
]

interface StateProps {
    theme: string
}
interface OwnProps {
    onSubmit: (RRule) => void
}
type RepeatDialogProps = OwnProps & StateProps
const RepeatDialog = (props: RepeatDialogProps): ReactElement => {
    const [startDate, setStartDate] = useState(new Date().toISOString())
    const [endDate, setEndDate] = useState(new Date().toISOString())
    const [repeatInterval, setRepeatInterval] = useState(1)
    const [repeatIntervalType, setRepeatIntervalType] = useState(RRule.WEEKLY)
    const [endType, setEndType] = useState('never')
    const [repeatNumber, setRepeatNumber] = useState(1)

    const startDateText = startDate ? formatRelativeDate(parseISO(startDate)) : 'Start date'
    const endDateText = endDate ? formatRelativeDate(parseISO(endDate)) : 'End date'

    const handleSubmit = (): void => {
        if (endType == 'date') {
            const r = new RRule({
                freq: repeatIntervalType,
                interval: repeatInterval,
                dtstart: parseISO(startDate),
                until: parseISO(endDate),
            })
            props.onSubmit(r)
        } else if (endType == 'number_of_times') {
            const r = new RRule({
                freq: repeatIntervalType,
                interval: repeatInterval,
                dtstart: parseISO(startDate),
                count: repeatNumber,
            })
            props.onSubmit(r)
        } else {
            const r = new RRule({
                freq: repeatIntervalType,
                interval: repeatInterval,
                dtstart: parseISO(startDate),
            })
            props.onSubmit(r)
        }
    }
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container onClick={(e) => e.stopPropagation()}>
                <OptionContainer>
                    <Label>Starts: </Label>
                    <Value>
                        <DatePicker
                            text={startDateText}
                            textSize="xxxsmall"
                            placeholder="Start date"
                            onSubmit={(val) => {
                                setStartDate(val)
                            }}
                            completed={false}
                        ></DatePicker>
                    </Value>
                </OptionContainer>
                <OptionContainer>
                    <Label>Repeats every: </Label>
                    <Value>
                        <Input
                            type="number"
                            min="0"
                            max="999"
                            id="repeats-every"
                            name="repeats-every"
                            onChange={(e) => setRepeatInterval(parseInt(e.target.value, 10))}
                        ></Input>
                        <StyledSelect
                            key="freq"
                            placeholder="Interval"
                            options={frequencyOptions}
                            styles={selectStyles({
                                fontSize: 'xxxsmall',
                                minWidth: '50px',
                                width: '65px',
                                theme: themes[props.theme],
                            })}
                            onChange={(newValue, actionMeta) => {
                                if (actionMeta.action == 'select-option') {
                                    setRepeatIntervalType(newValue.value)
                                }
                            }}
                        />
                    </Value>
                </OptionContainer>
                <OptionContainer>
                    <Label>Ends: </Label>
                    <Value>
                        <StyledSelect
                            key="end"
                            placeholder="Never"
                            options={endOptions}
                            styles={selectStyles({
                                fontSize: 'xxxsmall',
                                minWidth: '100px',
                                width: '110px',
                                theme: themes[props.theme],
                            })}
                            onChange={(newValue, actionMeta) => {
                                if (actionMeta.action == 'select-option') {
                                    setEndType(newValue.value)
                                }
                            }}
                        ></StyledSelect>
                    </Value>
                </OptionContainer>
                {endType == 'number_of_times' && (
                    <OptionContainer>
                        <Label>After X times: </Label>
                        <Value>
                            <Input
                                type="number"
                                min="0"
                                max="100"
                                id="repeat-number"
                                name="repeats-number"
                                onChange={(e) => setRepeatNumber(parseInt(e.target.value, 10))}
                            ></Input>
                        </Value>
                    </OptionContainer>
                )}
                {endType == 'date' && (
                    <OptionContainer>
                        <Label>End date: </Label>
                        <Value>
                            <DatePicker
                                completed={false}
                                text={endDateText}
                                textSize="xxxsmall"
                                placeholder="End date"
                                onSubmit={(val) => {
                                    setEndDate(val)
                                }}
                            ></DatePicker>
                        </Value>
                    </OptionContainer>
                )}

                <ButtonContainer>
                    <Button
                        type="primary"
                        spacing="compact"
                        text="Set Repeat"
                        textSize="xxxsmall"
                        width={'80px'}
                        onClick={(e) => {
                            handleSubmit()
                        }}
                    ></Button>
                </ButtonContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(RepeatDialog)
