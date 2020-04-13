import React, { Component, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import Select from 'react-select'
import { theme, selectStyles } from '../theme'
import { add, lastDayOfWeek } from 'date-fns'
import './DatePicker.css'
import DayPicker from 'react-day-picker/DayPicker'
import { Container } from './styled/DatePicker'

const options = [
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
  onSubmit: (d: Date) => void
  onEscape?: () => void
  placeholder: string
}
interface DatePickerState {
  selectedOption: boolean
  dayPickerVisible: boolean
}
class DatePicker extends Component<DatePickerProps, DatePickerState> {
  constructor(props) {
    super(props)
    this.state = { selectedOption: null, dayPickerVisible: false }
    this.handleChange = this.handleChange.bind(this)
    this.handleDayClick = this.handleDayClick.bind(this)
  }

  handleChange(newValue, actionMeta): void {
    if (actionMeta.action == 'select-option') {
      // if it's a custom date then show the calendar item
      if (newValue.label == 'Custom date') {
        this.setState({
          dayPickerVisible: true,
        })
        return
      }
      this.props.onSubmit(newValue.value)
    }
    return
  }

  handleDayClick(day, modifiers, e): void {
    this.setState({
      dayPickerVisible: false,
    })
    this.props.onSubmit(day)
    return
  }

  render(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Select
            autoFocus={true}
            placeholder={this.props.placeholder}
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={options}
            styles={selectStyles}
            escapeClearsValue={true}
            defaultMenuIsOpen={true}
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                this.props.onEscape()
              }
            }}
          />
          {this.state.dayPickerVisible && (
            <DayPicker tabIndex={0} onDayClick={this.handleDayClick} />
          )}
        </Container>
      </ThemeProvider>
    )
  }
}

export default DatePicker
