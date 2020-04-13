/* eslint-disable no-nested-ternary */
import styled from 'styled-components'

interface StyledProps {
  width: string
  height: string
  spacing: 'compact' | 'default'
}
export const StyledButton = styled.button<StyledProps>`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => props.theme.backgroundColour};
  color: ${(props) => props.theme.colour};
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  padding: ${(props) => (props.spacing === 'compact' ? '2px 5px' : '5px 8px')};
  height: ${(props) => (props.width ? props.width : 'auto')};
  width: ${(props) => (props.height ? props.height : 'auto')};
  margin: 2px;
  border: none;
  border-radius: 5px;
  border-color: ${(props) => props.theme.borderColour};
  text-align: center;
  &:hover {
    background-color: ${(props) => props.theme.hoverBackgroundColour};
    border-color: ${(props) => props.theme.hoverBackgroundColour};
    cursor: pointer;
  }
`
export const Contents = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 4px;
`

export const Icon = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`

export const Text = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  font-weight: ${(props) => props.theme.fontWeights.regular};
  margin-left: 4px;
`
