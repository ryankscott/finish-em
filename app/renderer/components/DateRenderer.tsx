import React, { ReactElement } from 'react'
import Button from './Button'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { Container } from './styled/DateRenderer'
import { IconType, ThemeType } from '../interfaces'
import { gql, useQuery } from '@apollo/client'

const GET_THEME = gql`
  query {
    theme @client
  }
`
type DateRendererProps = {
  completed: boolean
  deleted: boolean
  style?: 'subtle' | 'subtleInvert' | 'default' | 'invert'
  icon?: IconType
  tooltipText?: string
  text: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const DateRenderer = (props: DateRendererProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container completed={props.completed} type={props.icon}>
        <Button
          disabled={props.deleted}
          variant={props.style ? props.style : 'default'}
          size="sm"
          onClick={props.onClick}
          icon={props.icon}
          text={props.text}
          iconColour={!props.text ? theme.colours.altIconColour : null}
          tooltipText={props.tooltipText}
        />
      </Container>
    </ThemeProvider>
  )
}

export default DateRenderer
