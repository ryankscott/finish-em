import styled from 'styled-components'
import { Header2, Title } from '../Typography'
import CSS from 'csstype'
import { darken } from 'polished'
import { css, keyframes } from '../../StyledComponents'
import { fadeInUp, fadeOutDown } from 'react-animations'

export const WeekContainer = styled.div`
  display: grid;
  grid-template-rows: 2fr 1fr;
  grid-template-areas:
    'back day day day day forward'
    'week_of_year week_of_year week_of_year week_of_quarter week_of_quarter week_of_quarter';
  margin-bottom: 10px;
  width: 100%;
  align-items: baseline;
`

export const Section = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  flex-direction: row;
  margin: 0px;
  padding: 0px;
  width: 100%;
`

export const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 20px;
  padding: 20px 20px;
  width: 100%;
  align-items: center;
`
export const GoalContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px;
  padding-left: 20px;
  border: 1px solid ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  margin: 30px 5px;
`

export const BackContainer = styled.div`
  grid-area: back;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const ForwardContainer = styled.div`
  grid-area: forward;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`

export const WeeklyTitle = styled(Title)`
  grid-area: day;
  display: flex;
  justify-content: center;
`
export const ColumnHeader = styled(Header2)`
  padding: 5px 5px;
  padding-bottom: 15px;
  text-align: center;
  border-bottom: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
`

export const BacklogContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 650px;
  justify-content: center;
  padding: 20px 5px;
`

type DayContainerProps = {
  past: boolean
}
export const DayContainer = styled.div<DayContainerProps>`
  padding: 10px 5px;
  border: 1px solid ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  background-color: ${(props) =>
    props.past ? props.theme.colours.focusBackgroundColour : 'inherit'};
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
  width: 100%;
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
  animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'};
`
