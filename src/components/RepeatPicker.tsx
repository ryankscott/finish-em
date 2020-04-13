import React, { Component, ReactElement } from 'react'
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
interface RepeatPickerState {
  selectedOption: {}
  dayPickerVisible: boolean
}

class RepeatPicker extends Component<RepeatPickerProps, RepeatPickerState> {
  constructor(props) {
    super(props)
    this.state = { selectedOption: null, dayPickerVisible: false }
    this.handleChange = this.handleChange.bind(this)
    this.selectRef = React.createRef()
  }

  componentDidUpdate(prevProps): void {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.current.focus()
    }
    return
  }

  handleChange(newValue, actionMeta): void {
    if (actionMeta.action == 'select-option') {
      this.props.onSubmit(newValue.value)
    }
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
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                this.props.onEscape()
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
