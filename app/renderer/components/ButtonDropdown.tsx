import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import Creatable from 'react-select/creatable'
import { themes, selectStyles } from '../theme'
import CSS from 'csstype'
import Button from './Button'
import { Container, SelectContainer } from './styled/ButtonDropdown'
import { IconType, ThemeType } from '../interfaces'
import { gql, useQuery } from '@apollo/client'
import { OptionsType } from 'react-select'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type ButtonDropdownProps = {
  defaultButtonText: string
  defaultButtonIcon?: IconType
  defaultButtonIconColour?: string
  buttonText: string | JSX.Element
  buttonIcon?: IconType
  buttonIconColour?: CSS.Property.Color
  selectPlaceholder?: string
  selectPlacement?: 'auto' | 'bottom' | 'top'
  createable?: boolean
  options: OptionsType<any>
  selectPosition?: 'auto' | 'top' | 'bottom'
  onSubmit: (value: string) => void
  onEscape?: () => void
  style?: 'primary' | 'subtle' | 'subtleInvert' | 'default' | 'invert'
  completed: boolean
  deleted?: boolean
  showSelect?: boolean
}

function ButtonDropdown(props: ButtonDropdownProps): ReactElement {
  const [showSelect, setShowSelect] = useState(false)

  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const theme: ThemeType = themes[data.theme]

  const handleChange = (newValue, actionMeta): void => {
    if (actionMeta.action == 'select-option') {
      props.onSubmit(newValue.value)
    }
    setShowSelect(false)
    return
  }
  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node.current.contains(e.target)) {
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

  return (
    <ThemeProvider theme={theme}>
      <Container completed={props.completed} ref={node}>
        <Button
          width="100%"
          position="flex-start"
          spacing="compact"
          type={props.deleted ? 'disabled' : props.style ? props.style : 'default'}
          onClick={(e) => {
            if (props.completed) return
            setShowSelect(!showSelect)
            e.stopPropagation()
          }}
          text={props.buttonText ? props.buttonText : props.defaultButtonText}
          iconColour={
            props.buttonIconColour ? props.buttonIconColour : props.defaultButtonIconColour
          }
          icon={props.buttonIcon ? props.buttonIcon : props.defaultButtonIcon}
        />
        {(showSelect || props.showSelect) && (
          <SelectContainer>
            <Creatable
              autoFocus={true}
              menuPlacement={props.selectPlacement != undefined ? props.selectPlacement : 'auto'}
              placeholder={props.selectPlaceholder}
              isSearchable
              onChange={handleChange}
              options={props.options}
              styles={selectStyles({
                fontSize: 'xxsmall',
                theme: theme,
                height: '28px',
                invert: props.style == 'subtleInvert' || props.style == 'invert',
              })}
              escapeClearsValue={true}
              defaultMenuIsOpen={true}
              onKeyDown={(e) => {
                if (e.key == 'Escape') {
                  setShowSelect(false)
                  if (props.onEscape) {
                    props.onEscape()
                  }
                }
                e.stopPropagation()
              }}
            />
          </SelectContainer>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default ButtonDropdown
