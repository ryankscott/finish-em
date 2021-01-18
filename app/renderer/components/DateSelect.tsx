import { gql, useQuery } from '@apollo/client'
import { add, lastDayOfWeek, sub } from 'date-fns'
import React, { ReactElement, useState } from 'react'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import { Wrapper } from './styled/ReactDatePicker'

const options: { value: () => Date; label: string }[] = [
  { value: () => new Date(), label: 'Today' },
  {
    value: () => add(new Date(), { days: 1 }),
    label: 'Tomorrow',
  },
  {
    value: () =>
      sub(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
        days: 2,
      }),
    label: 'End of Week',
  },
  {
    value: () =>
      add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
        days: 1,
      }),
    label: 'Next Week',
  },
  {
    value: null,
    label: 'Custom date',
  },
  { value: null, label: 'No date' },
]

const GET_THEME = gql`
  query {
    theme @client
  }
`
type DateSelectProps = {
  autoFocus?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  icon?: 'due' | 'scheduled'
  onSubmit: (d: Date) => void
  onEscape?: () => void
  placeholder: string
  textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
}

function DateSelect(props: DateSelectProps): ReactElement {
  const [dayPickerVisible, setDayPickerVisible] = useState(false)
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  const handleChange = (newValue, actionMeta): void => {
    setDayPickerVisible(false)
    if (actionMeta.action == 'select-option') {
      // if it's a custom date then show the calendar item
      if (newValue.label == 'Custom date') {
        setDayPickerVisible(true)
        return
      }
      // I _think_ this gross hack will move everything to be UTC times
      props.onSubmit(
        newValue.value ? sub(newValue.value(), { minutes: new Date().getTimezoneOffset() }) : null,
      )
    }
    return
  }

  const handleDayClick = (day: Date): void => {
    // I _think_ this gross hack will move everything to be UTC times
    const d = sub(day, { minutes: new Date().getTimezoneOffset() })
    setDayPickerVisible(false)
    props.onSubmit(d)
    return
  }

  return (
    <ThemeProvider theme={theme}>
      <Select
        isDisabled={props.disabled != undefined ? props.disabled : false}
        autoFocus={props.autoFocus != undefined ? props.autoFocus : true}
        placeholder={props.placeholder}
        onChange={handleChange}
        options={options}
        styles={selectStyles({
          fontSize: props.textSize || 'xxsmall',
          theme: theme,
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
      <div style={{ position: 'absolute', top: '29px', right: '0px' }}>
        {dayPickerVisible && (
          <Wrapper>
            <DatePicker
              utcOffset={new Date().getTimezoneOffset()}
              inline
              tabIndex={0}
              onChange={handleDayClick}
            />
          </Wrapper>
        )}
      </div>
    </ThemeProvider>
  )
}

export default DateSelect
