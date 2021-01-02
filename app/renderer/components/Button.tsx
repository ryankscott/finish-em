import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { StyledButton, Contents, Icon, Text } from './styled/Button'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'
import Tooltip from './Tooltip'
import { v4 as uuidv4 } from 'uuid'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type ButtonProps = {
  id?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  spacing?: 'compactIcon' | 'compact' | 'default'
  type: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert' | 'disabled'
  text?: string | JSX.Element
  textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
  textWeight?: string
  iconSize?: string
  iconColour?: string
  tabIndex?: number
  width?: string
  height?: string
  iconPosition?: 'before' | 'after'
  icon?: IconType
  rotate?: number // Note: This lovely little hack is because of a StyledComponents bug https://github.com/styled-components/styled-components/issues/1198
  translateY?: number
  translateZ?: number
  tooltipText?: string
}

const Button = (props: ButtonProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  const id = uuidv4()
  return (
    <ThemeProvider theme={theme}>
      <StyledButton
        id={props.id}
        spacing={props.spacing}
        height={props.height}
        width={props.width}
        onClick={props.onClick}
        buttonType={props.type}
        data-tip
        data-for={id}
        tabIndex={props.tabIndex != undefined ? props.tabIndex : -1}
        iconOnly={props.icon && !props.text}
      >
        <Contents>
          {props.icon && !(props.iconPosition == 'after') && (
            <Icon
              iconPosition={props.iconPosition}
              rotate={props.rotate != undefined ? props.rotate : 0}
              translateY={props.translateY != undefined ? props.translateY : 0}
              translateZ={props.translateZ != undefined ? props.translateZ : 0}
            >
              {Icons[props.icon](
                props.iconSize || null,
                props.iconSize || null,
                props.iconColour || null,
              )}
            </Icon>
          )}
          {props.text && (
            <Text
              textWeight={props.textWeight}
              textSize={props.textSize}
              hasIcon={props.icon != undefined}
            >
              {props.text}
            </Text>
          )}
          {props.icon && props.iconPosition == 'after' && (
            <Icon iconPosition={props.iconPosition}>
              {Icons[props.icon](
                props.iconSize || null,
                props.iconSize || null,
                props.iconColour || null,
              )}
            </Icon>
          )}
        </Contents>
      </StyledButton>
      {props.tooltipText && <Tooltip id={id} text={props.tooltipText} />}
    </ThemeProvider>
  )
}

export default Button
