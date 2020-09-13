import styled, { keyframes, css } from '../../StyledComponents'
import { fadeInLeft, fadeOutRight } from 'react-animations'
import { darken } from 'polished'
import CSS from 'csstype'

export const NoItemText = styled.p`
    color: ${(props) => props.theme.colours.disabledTextColour};
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    padding-left: 10px;
`

export const Container = styled.div`
    width: 100%;
    margin: 10px 0px;
`

type DraggableListProps = {
    isDraggingOver: boolean
}
export const DraggableList = styled.div<DraggableListProps>`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    background: ${(props) => (props.isDraggingOver ? 'inherit' : 'inherit')};
    width: 100%;
    padding: ${(props) => (props.isDraggingOver ? '40px 5px' : '5px')};
`

const fadeInAnimation = keyframes`${fadeInLeft}`
const fadeOutAnimation = keyframes`${fadeOutRight}`
const entryAnimation = (props) =>
    css`
        ${fadeInAnimation} 0.2s
    `
const exitAnimation = (props) =>
    css`
        ${fadeOutAnimation} 0.5s
    `

type DraggableContainerProps = {
    isDragging: boolean
    draggableStyle: CSS.Properties
    state: string
}
export const DraggableContainer = styled.div<DraggableContainerProps>`
    ...props.draggableStyle;
    position: relative;
    display: flex;
    flex-direction: column;
    height: auto;
    user-select: none;
    padding: 0px;
    margin: 0px;
    border-radius: 5px;
    background: ${(props) =>
        props.isDragging
            ? props.theme.colours.focusDialogBackgroundColour
            : props.theme.colours.backgroundColour};
    animation: ${(props) =>
        props.state == 'entering'
            ? entryAnimation
            : props.state == 'exiting'
            ? exitAnimation
            : 'none'}
`
