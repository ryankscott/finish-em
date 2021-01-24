import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { Container, SelectContainer } from './styled/DatePicker'
import DateRenderer from './DateRenderer'
import DateSelect from './DateSelect'
import { IconType, ThemeType } from '../interfaces'
import { gql, useQuery } from '@apollo/client'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type DatePickerProps = {
  onSubmit: (d: Date) => void
  onEscape?: () => void
  style?: 'default' | 'subtle' | 'subtleInvert' | 'invert'
  showSelect?: boolean
  selectPosition?: 'auto' | 'top' | 'bottom'
  searchPlaceholder: string
  completed: boolean
  deleted?: boolean
  text?: string
  tooltipText?: string
  textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
  icon?: IconType
}

function DatePicker(props: DatePickerProps): ReactElement {
  const [showSelect, setShowSelect] = useState(false)
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

  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container ref={node}>
        <DateRenderer
          style={props.style}
          completed={props.completed}
          deleted={props.deleted}
          textSize={props.textSize}
          icon={props.icon}
          position="flex-start"
          text={props.text}
          tooltipText={props.tooltipText}
          onClick={(e) => {
            e.stopPropagation()
            if (props.completed) return
            setShowSelect(!showSelect)
          }}
        />
        {(props.showSelect || showSelect) && (
          <SelectContainer>
            <DateSelect
              selectPlacement={props.selectPosition}
              style={props.style}
              placeholder={props.searchPlaceholder}
              onEscape={() => {
                setShowSelect(false)
                if (props.onEscape) {
                  props.onEscape()
                }
              }}
              onSubmit={(d) => {
                setShowSelect(false)
                props.onSubmit(d)
              }}
              textSize={props.textSize}
            ></DateSelect>
          </SelectContainer>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default DatePicker
