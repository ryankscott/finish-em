import styled, { css, keyframes } from 'styled-components'
import { headShake } from 'react-animations'

export const Container = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 15px 2px;
  overflow-x: visible;
  margin: 2px;
`
export interface ItemCreatorContainer {
  visible: boolean
  width: string
  backgroundColour: string
  animate: boolean
}
const headShakeAnimation = keyframes`${headShake}`
const animation = (props) => {
  css`
    ${headShakeAnimation} 1s
  `
}
export const ItemCreatorContainer = styled.div<ItemCreatorContainer>`
  animation: ${(props) => (props.animate ? animation : 'none')};
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  width: ${(props) => (props.visible ? (props.width ? props.width : '10000px') : '0px')};
  opacity: ${(props) => (props.visible ? '1' : '0')};
  transition: width 0.2s ease-in-out;
`

export const HelpButtonContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 2px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0px 2px;
`
