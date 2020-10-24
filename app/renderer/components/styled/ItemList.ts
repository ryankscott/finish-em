import styled, { keyframes, css } from '../../StyledComponents'
import { fadeInLeft, fadeOutRight } from 'react-animations'

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

type ItemContainerProps = {
  state: string
}
export const ItemContainer = styled.div<ItemContainerProps>`
  animation: ${(props) =>
    props.state == 'entering' ? entryAnimation : props.state == 'exiting' ? exitAnimation : 'none'};
`

export const NoItemText = styled.p`
  color: ${(props) => props.theme.colours.disabledTextColour};
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.small};
  padding: 11px 0px;
  padding-left: 10px;
`

export const Container = styled.div`
  width: 100%;
  margin: 11px 0px;
`
