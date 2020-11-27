import styled, { css, keyframes } from 'styled-components'
import { headShake } from 'react-animations'

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 2px;
  overflow-x: hidden;
  margin: 2px 10px;
  width: 1000px;
`
export interface ItemCreatorContainer {
  visible: boolean
  width: string
  backgroundColour: string
  animate: boolean
}
const headShakeAnimation = keyframes`${headShake}`
const animation = (props) =>
  css`
    ${headShakeAnimation} 1s
  `
export const ItemCreatorContainer = styled.div<ItemCreatorContainer>`
  animation: ${(props) => (props.animate ? animation : 'none')};
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  width: ${(props) => (props.visible ? (props.width ? props.width : '10000px') : '0px')};
  opacity: ${(props) => (props.visible ? '1' : '0')};
  transition: width 0.2s ease-in-out;
`

export const HelpButtonContainer = styled.div`
  position: absolute;
  right: 2px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 2px;
`
