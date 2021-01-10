import styled, { keyframes, css } from '../../StyledComponents'
import { fadeInUp, fadeOutDown } from 'react-animations'
import { darken, transparentize } from 'polished'

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
  state: string
}
export const DraggableContainer = styled.div<DraggableContainerProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  height: auto;
  user-select: none;
  padding: 0px;
  margin: 0px;
  border-radius: 5px;
  margin-bottom: 20px;
  transition: all 0.1s ease-in-out;
  border: 1px solid;
  border-color: ${(props) => (props.isDragging ? props.theme.colours.borderColour : 'transparent')};
  background: ${(props) => props.theme.colours.backgroundColour};
  box-shadow: ${(props) =>
    props.isDragging ? '1px 2px 6px ' + darken(0.05, props.theme.colours.borderColour) : '0px'};
  animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'};
  &:hover {
    border-color: ${(props) => props.theme.colours.borderColour};
    box-shadow: 0px 1px 2px ${(props) => props.theme.colours.borderColour};
  }
`

export const DragHandle = styled.div`
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 20px;
  top: 0px;
  width: 100%;
  z-index: 100;
  opacity: 0;
  transition: all 0.1s ease-in-out;
  border-radius: 5px;
  :active {
    opacity: 1;
    background-color: ${(props) => transparentize(0.6, props.theme.colours.focusBackgroundColour)};
  }
  :hover {
    opacity: 1;
    background-color: ${(props) => transparentize(0.6, props.theme.colours.focusBackgroundColour)};
  }
`
