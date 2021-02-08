import React, { ReactElement, useState, useRef, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import Select from 'react-select'
import { themes, selectStyles } from '../theme'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import { SelectContainer } from './styled/RepeatPicker'
import DateRenderer from './DateRenderer'
import RepeatDialog from './RepeatDialog'
import { rruleToText, capitaliseFirstLetter } from '../utils'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

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
      byweekday: new Date().getDay() == 0 ? 6 : new Date().getDay() - 1,
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

type RepeatPickerProps = {
  repeat: RRule
  onSubmit: (value: RRule) => void
  onEscape?: () => void
  showSelect?: boolean
  searchPlaceholder: string
  completed: boolean
  deleted?: boolean
  style?: 'default' | 'subtle' | 'subtleInvert'
}

function RepeatPicker(props: RepeatPickerProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
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
    console.log('here')
    setShowSelect(false)
    setRepeatDialogVisible(false)
    return
  }

  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node?.current?.contains(e.target)) {
      return
    }
    setShowSelect(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  const repeatText = props.repeat ? capitaliseFirstLetter(rruleToText(props.repeat)) : 'Add repeat'
  const tooltipText = props.repeat ? capitaliseFirstLetter(props.repeat.toText()) : 'Repeat'
  return (
    <ThemeProvider theme={theme}>
      <div ref={node} style={{ width: '100%' }}>
        <DateRenderer
          tooltipText={tooltipText}
          completed={props.completed}
          icon="repeat"
          position="flex-start"
          style={props.style}
          text={repeatText}
          deleted={props.deleted}
          onClick={(e) => {
            setShowSelect(!showSelect)
            setRepeatDialogVisible(false)
            e.stopPropagation()
            if (props.completed) return
          }}
        />

        {(showSelect || props.showSelect) && (
          <>
            <SelectContainer>
              <Select
                autoFocus={true}
                placeholder={props.searchPlaceholder}
                onMenuOpen={() => {
                  setRepeatDialogVisible(false)
                }}
                onChange={handleChange}
                options={options}
                tabIndex="0"
                defaultMenuIsOpen={true}
                escapeClearsValue={true}
                onKeyDown={(e) => {
                  if (e.key == 'Escape') {
                    setShowSelect(false)
                    setRepeatDialogVisible(false)
                    if (props.onEscape) {
                      props.onEscape()
                    }
                  }
                }}
                styles={selectStyles({
                  fontSize: 'xxsmall',
                  minWidth: '140px',
                  theme: theme,
                  height: '28px',
                })}
              />
              {repeatDialogVisible && (
                <RepeatDialog
                  onSubmit={(r) => {
                    props.onSubmit(r)
                    setRepeatDialogVisible(false)
                    setShowSelect(false)
                  }}
                />
              )}
            </SelectContainer>
          </>
        )}
      </div>
    </ThemeProvider>
  )
}

export default RepeatPicker
