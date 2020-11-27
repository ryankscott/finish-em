import { gql, useQuery } from '@apollo/client'
import { add, lastDayOfWeek, sub } from 'date-fns'
import React, { ReactElement, useState } from 'react'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import { Wrapper } from './styled/ReactDatePicker'

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
  onSubmit: (d: string) => void
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
      props.onSubmit(newValue.value ? newValue.value() : null)
    }
    return
  }

  const handleDayClick = (day): void => {
    setDayPickerVisible(false)
    props.onSubmit(day)
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
            <DatePicker inline tabIndex={0} onChange={handleDayClick} />
          </Wrapper>
        )}
      </div>
    </ThemeProvider>
  )
}

export default DateSelect
