import styled from 'styled-components'
import { IconType } from '../../interfaces'

interface ContainerProps {
    completed: boolean
    type: IconType
}

export const Container = styled.div<ContainerProps>`
    display: flex;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    color: ${(props) => props.theme.colours.textColour};
    border-radius: 5px;
    text-decoration: ${(props) => (props.completed == true ? 'line-through' : null)};
`

interface SubTextProps {
    position: 'center' | 'flex-end' | 'flex-start'
}
export const SubTextContainer = styled.div<SubTextProps>`
    display: flex;
    min-width: 40px;
    min-height: 20px;
    flex-direction: row;
    align-items: center;
    justify-content: ${(props) => props.position};
    margin-left: ${(props) => (props.position == 'flex-start' ? '32px' : '0px')};
`