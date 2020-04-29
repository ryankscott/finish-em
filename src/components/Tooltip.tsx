import React, { ReactElement } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import ReactTooltip from 'react-tooltip'
import { Paragraph } from './Typography'

interface TooltipProps {
    id: string
    text: string
}
export const StyledTooltip = styled(ReactTooltip)`
    padding: 2px 5px !important;
    margin: 0px !important;
`
export const Tooltip = (props: TooltipProps): ReactElement => {
    return (
        <ThemeProvider theme={theme}>
            <StyledTooltip
                id={props.id}
                type="dark"
                effect="float"
                place="top"
                delayShow={500}
            >
                <Paragraph invert>{props.text}</Paragraph>
            </StyledTooltip>
        </ThemeProvider>
    )
}
