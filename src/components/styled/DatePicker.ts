import styled from 'styled-components'
import { Paragraph } from '../Typography'

export const SelectContainer = styled.div`
    display: flex;
    position: absolute;
    flex-direction: column;
    min-width: 80px;
`

interface DisabledContainerProps {
    completed: boolean
}
export const DisabledContainer = styled.div<DisabledContainerProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 5px;
    margin: 0px 2px;
    text-decoration: ${(props) =>
        props.completed ? 'strike-through' : 'none'};
`

export const IconContainer = styled.div`
    display: flex;
    padding-right: 2px;
    align-items: center;
`
export const DisabledText = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
`
