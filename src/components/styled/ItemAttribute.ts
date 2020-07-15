import styled from 'styled-components'
import { Paragraph } from '../Typography'

interface AttributeContainerProps {
    completed: boolean
}
export const AttributeContainer = styled.div<AttributeContainerProps>`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0px 5px;
    margin: 0px 2px;
    text-decoration: ${(props) => (props.completed ? 'strike-through' : 'none')};
`

export const AttributeIcon = styled.div`
    display: flex;
    padding-right: 2px;
    align-items: center;
`
export const AttributeText = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
`
