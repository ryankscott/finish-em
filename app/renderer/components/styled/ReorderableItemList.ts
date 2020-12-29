import styled, { keyframes, css } from '../../StyledComponents'
import { fadeInLeft, fadeOutRight } from 'react-animations'
import { darken } from 'polished'
import CSS from 'csstype'

export const NoItemText = styled.p`
  color: ${(props) => props.theme.colours.disabledTextColour};
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.small};
  padding: 10px 0px;
  padding-left: 10px;
`

export const Container = styled.div`
  width: 100%;
  margin: 10px 0px;
  z-index: 0;
`

type DroppableListProps = {
  isDraggingOver: boolean
}
export const DroppableList = styled.div<DroppableListProps>`
  z-index: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 5px;
  width: 100%;
  padding: ${(props) => (props.isDraggingOver ? '20px 5px' : '5px')};
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
    props.isDragging ? '1px 2px 6px ' + darken(0.05, props.theme.colours.borderColour) : '0px'};
`
