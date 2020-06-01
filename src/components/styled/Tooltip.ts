import { Paragraph } from '../Typography'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

export const StyledParagraph = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
`
export const StyledTooltip = styled(ReactTooltip)`
    padding: 2px 5px !important;
    margin: 0px !important;
`
