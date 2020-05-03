import React, { ReactElement } from 'react'
import { Button } from './Button'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Container, SubTextContainer } from './styled/DateRenderer'

interface DateRendererProps {
    completed: boolean
    visible?: boolean
    style?: 'subtle' | 'subtleInvert' | 'default'
    position: 'center' | 'flex-end' | 'flex-start'
    type: 'due' | 'repeat' | 'scheduled'
    text: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const DateRenderer = (props: DateRendererProps): ReactElement => {
    return (
        <ThemeProvider theme={theme}>
            <Container
                visible={props.visible}
                completed={props.completed}
                type={props.type}
            >
                <SubTextContainer key={props.type} position={props.position}>
                    <Button
                        type={props.style || 'default'}
                        spacing="compact"
                        onClick={props.onClick}
                        icon={props.type}
                        text={props.text}
                        iconColour={
                            !props.text ? theme.colours.lightIconColour : null
                        }
                    ></Button>
                </SubTextContainer>
            </Container>
        </ThemeProvider>
    )
}
export default DateRenderer
