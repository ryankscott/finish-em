import React, { ReactElement } from 'react'
import { Button } from './Button'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Container, SubTextContainer } from './styled/DateRenderer'
import { IconType } from '../interfaces'

interface DateRendererProps {
    completed: boolean
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    style?: 'subtle' | 'subtleInvert' | 'default'
    position: 'center' | 'flex-end' | 'flex-start'
    icon?: IconType
    text: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

const DateRenderer = (props: DateRendererProps): ReactElement => {
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
                        textSize={props.textSize}
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
