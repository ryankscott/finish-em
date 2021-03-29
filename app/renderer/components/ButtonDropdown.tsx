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
    return
  }

  return (
    <ThemeProvider theme={theme}>
      <Container completed={props.completed}>
        <SelectContainer>
          <Creatable
            menuPlacement={props.selectPlacement != undefined ? props.selectPlacement : 'auto'}
            placeholder={props.selectPlaceholder}
            isSearchable
            onChange={handleChange}
            options={props.options}
            formatOptionLabel={function (data) {
              return <span dangerouslySetInnerHTML={{ __html: data.label }} />
            }}
            styles={selectStyles({
              fontSize: '10px',
              textColour: '#333',
              altTextColour: '#FFF',
              backgroundColour: '#F2F2F2',
              altBackgroundColour: '#333',
            })}
            escapeClearsValue={true}
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                if (props.onEscape) {
                  props.onEscape()
                }
              }
              e.stopPropagation()
            }}
          />
        </SelectContainer>
      </Container>
    </ThemeProvider>
  )
}

export default ButtonDropdown
