import styled, { keyframes, css } from '../../StyledComponents'
import CSS from 'csstype'
import { fadeInUp, fadeOutDown } from 'react-animations'
import { darken } from 'polished'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  width: 100%;
  margin: 20px 0px 5px 0px;
`

type DraggableListProps = {
  isDraggingOver: boolean
}
export const DraggableList = styled.div<DraggableListProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${(props) => (props.isDraggingOver ? 'inherit' : 'inherit')};
  width: 100%;
  margin: 0px;
  padding: ${(props) => (props.isDraggingOver ? '40px 5px' : '5px')};
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
  background: ${(props) => props.theme.colours.backgroundColour};
    box-shadow: ${(props) =>
      props.isDragging ? '1px 2px 6px ' + darken(0.1, props.theme.colours.borderColour) : '0px'};
    animation: ${(props) =>
      props.state == 'entering'
        ? entryAnimation
        : props.state == 'exiting'
        ? exitAnimation
        : 'none'}
`
