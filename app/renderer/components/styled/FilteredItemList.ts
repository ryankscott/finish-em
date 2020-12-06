import Select from 'react-select'
import styled from 'styled-components'
import { Paragraph } from '../Typography'
import { lighten } from 'polished'
import { fadeInLeft, fadeOutRight } from 'react-animations'
import { css, keyframes } from '../../StyledComponents'

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

export const HeaderBar = styled.div`
  position: relative;
  display: grid;
  align-items: center;
  width: auto;
  padding: 12px 5px;
  margin-top: 0px;
  border-radius: 5px 5px 0px 0px;
  box-shadow: ${(props) => '0px 1px 4px ' + props.theme.colours.borderColour};
  grid-template-rows: 40px;
  grid-template-columns: 30px auto auto;
  grid-template-areas: 'hide header filterBar';
`

export const FilterBar = styled.div`
  position: relative;
  grid-area: filterBar;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`

export const HideButtonContainer = styled.div`
  grid-area: hide;
`

export const ItemListContainer = styled.div`
  width: 100%;
  display: flex;
  transition: 0.2s ease-in-out;
  padding: 0px 8px;
`

export const SortContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  transition: 0.2s ease-in-out;
  width: 140px;
`

export const SortSelect = styled(Select)`
  margin: 2px 0px;
`

export const ListHeader = styled.div`
  display: flex;
  flex-direction: row;
  font-size: ${(props) => props.theme.fontSizes.regular};
  grid-area: header;
  padding: 2px 0px;
  margin: 0px 5px;
  align-self: center;
`
export const ListItemCount = styled(Paragraph)`
  padding: 0px 5px;
  min-width: 80px;
  color: ${(props) => lighten(0.2, props.theme.colours.textColour)};
`
type ContainerProps = {
  state: string
}
export const Container = styled.div<ContainerProps>`
  margin: 0px;
  margin-bottom: 10px;
  padding: 0px;
  width: 100%;
  border-radius: 5px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  min-width: 666px;
  animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'};
`
type EditableContainerProps = {
  state: string
}
export const EditableContainer = styled.div<EditableContainerProps>`
  display: flex;
  animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'};
`
