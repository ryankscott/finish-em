import styled, { keyframes, css } from '../../StyledComponents'
import CSS from 'csstype'
import { fadeInUp, fadeOutDown } from 'react-animations'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 100%;
    margin: 20px 0px 5px 0px;
`

type DraggableListProps = {
    isDraggingOver: boolean,
}
export const DraggableList = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: ${(props) => (props.isDragingOver ? 'inherit' : 'inherit')};
    width: 100%;
    margin: 0px;
    padding: 0px;
`

const fadeInAnimation = keyframes`${fadeInUp}`
const fadeOutAnimation = keyframes`${fadeOutDown}`
const entryAnimation = (props) =>
    css`
        ${fadeInAnimation} 0.2s
    `
const exitAnimation = (props) =>
    css`
        ${fadeOutAnimation} 0.5s
    `

type DraggableContainerProps = {
    isDragging: boolean,
    draggableStyle: CSS.Property,
    state: string,
}
export const DraggableContainer = styled.div`
...props.draggableStyle;
display: flex;
flex-direction: row;
height: auto;
user-select: none;
margin: 0px;
padding: 5px;
border-radius: 5px;
background: ${(props) =>
    props.isDragging
        ? props.theme.colours.focusDialogBackgroundColour
        : props.theme.colours.backgroundColour};
animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'}

`
