import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import RRule, { Frequency } from 'rrule'
import Button from './Button'
import DatePicker from './DatePicker'
import { formatRelativeDate } from '../utils'
import { gql, useQuery } from '@apollo/client'
import {
  OptionContainer,
  Label,
  Value,
  Container,
  Input,
  ButtonContainer,
} from './styled/RepeatDialog'
import Select from 'react-select'
import { ThemeType } from '../interfaces'
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

const GET_THEME = gql`
  query {
    theme @client
  }
`

type RepeatDialogProps = {
  onSubmit: (RRule) => void
}
const RepeatDialog = (props: RepeatDialogProps): ReactElement => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [repeatInterval, setRepeatInterval] = useState(1)
  const [repeatIntervalType, setRepeatIntervalType] = useState(RRule.WEEKLY)
  const [endType, setEndType] = useState('never')
  const [repeatNumber, setRepeatNumber] = useState(1)

  const startDateText = startDate ? formatRelativeDate(startDate) : 'Start date'
  const endDateText = endDate ? formatRelativeDate(endDate) : 'End date'
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  const handleSubmit = (): void => {
    if (endType == 'date') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        until: endDate,
      })
      props.onSubmit(r)
    } else if (endType == 'number_of_times') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        count: repeatNumber,
      })
      props.onSubmit(r)
    } else {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
      })
      props.onSubmit(r)
    }
  }
  return (
    <ThemeProvider theme={theme}>
      <Container onClick={(e) => e.stopPropagation()}>
        <OptionContainer>
          <Label>Starts: </Label>
          <Value>
            <DatePicker
              style={'default'}
              text={startDateText}
              textSize="xxxsmall"
              searchPlaceholder="Start date"
              onSubmit={(val) => {
                console.log(val)
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
            <Select
              key="freq"
              placeholder="Interval"
              options={frequencyOptions}
              styles={selectStyles({
                fontSize: 'xxxsmall',
                theme: theme,
                minWidth: '70px',
                width: '70px',
                height: '28px',
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
            <Select
              key="end"
              placeholder="Never"
              options={endOptions}
              styles={selectStyles({
                fontSize: 'xxxsmall',
                minWidth: '100px',
                width: '110px',
                theme: theme,
              })}
              onChange={(newValue, actionMeta) => {
                if (actionMeta.action == 'select-option') {
                  setEndType(newValue.value)
                }
              }}
            />
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
                searchPlaceholder="End date"
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
            onClick={() => {
              handleSubmit()
            }}
          ></Button>
        </ButtonContainer>
      </Container>
    </ThemeProvider>
  )
}

export default RepeatDialog
