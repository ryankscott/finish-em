import React, { ReactElement } from 'react'
import { Button } from './Button'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Container, SubTextContainer } from './styled/DateRenderer'

interface DateRendererProps {
  completed: boolean
  position: 'center' | 'flex-end' | 'flex-start'
  type: 'due' | 'repeat' | 'scheduled'
  text: string
  onClick?: () => void
}

const DateRenderer = (props: DateRendererProps): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Container completed={props.completed} type={props.type}>
        <SubTextContainer key={props.type} position={props.position}>
          <Button
            type="default"
            spacing="compact"
            onClick={props.onClick}
            icon={props.type}
          >
            {props.text}
          </Button>
        </SubTextContainer>
      </Container>
    </ThemeProvider>
  )
}
export default DateRenderer
