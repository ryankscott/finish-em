import React, { ReactElement } from 'react'
import Button from './Button'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { Container, SubTextContainer } from './styled/DateRenderer'
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
  textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
  style?: 'subtle' | 'subtleInvert' | 'default'
  position: 'center' | 'flex-end' | 'flex-start'
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
        <SubTextContainer key={props.icon} position={props.position}>
          <Button
            type={props.style || 'default'}
            spacing="compact"
            onClick={props.onClick}
            icon={props.icon}
            text={props.text}
            isDisabled={props.deleted}
            textSize={props.textSize}
            iconColour={!props.text ? theme.colours.altIconColour : null}
            tooltipText={props.tooltipText}
          ></Button>
        </SubTextContainer>
      </Container>
    </ThemeProvider>
  )
}

export default DateRenderer
