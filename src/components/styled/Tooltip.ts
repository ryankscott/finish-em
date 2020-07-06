import { Paragraph } from '../Typography'
import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

export const StyledParagraph = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
`
export const StyledTooltip = styled(ReactTooltip)`
    padding: 2px 5px !important;
    margin: 0px !important;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
`
