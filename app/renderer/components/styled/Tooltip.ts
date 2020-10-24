import styled from 'styled-components'
import ReactTooltip from 'react-tooltip'

export const StyledTooltip = styled(ReactTooltip)`
    padding: 5px 8px !important;
    margin: 0px !important;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
    font-size: ${(props) => props.theme.fontSizes.xxsmall} !important;
    color: ${(props) => props.theme.colours.altTextColour};
`
