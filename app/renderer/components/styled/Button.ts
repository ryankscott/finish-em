/* eslint-disable no-nested-ternary */
import styled from '../../StyledComponents'

interface StyledProps {
  width: string
  height: string
  spacing: 'compact' | 'default' | 'compactIcon'
  buttonType: 'primary' | 'error' | 'default' | 'invert' | 'subtle' | 'subtleInvert' | 'disabled'
  position: 'flex-end' | 'flex-start' | 'center'
  iconOnly: boolean
}

// TODO: Fix the font-family here
export const StyledButton = styled.button<StyledProps>`
  display: flex;
  position: relative;
  font-family: ${(props) => props.theme.font.sansSerif};
  flex-direction: row;
  justify-content: ${(props) => (props.position ? props.position : 'center')};
  align-items: center;
  background-color: ${(props) => props.theme.button[props.buttonType].backgroundColour};
  color: ${(props) => props.theme.button[props.buttonType].colour};
  padding: ${(props) =>
    props.spacing == 'compactIcon'
      ? '1px'
      : props.iconOnly
      ? '4px'
      : props.spacing === 'compact'
      ? '5px 8px'
      : '8px 10px'};
  width: ${(props) => (props.width ? props.width : 'auto')};
  height: ${(props) => (props.height ? props.height : 'auto')};
  margin: 2px;
  cursor: ${(props) => (props.buttonType == 'disabled' ? 'not-allowed' : 'pointer')};
  border-radius: 5px;
  border: 1px solid;
  border-color: ${(props) => props.theme.button[props.buttonType].borderColour};
  text-align: center;
  box-shadow: ${(props) =>
    props.buttonType == 'primary' && !props.iconOnly ? '0px 1px 4px rgba(0, 0, 0, 0.1)' : '0px'};
  &:hover {
    background-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
    border-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
  }
  &:active {
    background-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
    border-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
  }
  &:focus {
    background-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
    border-color: ${(props) => props.theme.button[props.buttonType].hoverBackgroundColour};
  }
`
export const Contents = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0px;
`

interface IconProps {
  iconPosition: 'after' | 'before'
  rotate?: number
  translateY?: number
  translateZ?: number
}
export const Icon = styled.div<IconProps>`
  display: flex;
  transition: all 0.1s ease-out;
  transform: ${(props) => (props.rotate ? `rotate(90deg)` : '')};
  transform: ${(props) =>
    props.translateY ? 'rotateY(180deg)' : props.translateZ ? 'rotateZ(180deg)' : ''};
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding-left: ${(props) => (props.iconPosition == 'after' ? '5px' : '0px')};
  padding-right: ${(props) => (props.iconPosition == 'before' ? '5px' : '0px')};
`

interface TextProps {
  hasIcon: boolean
  textSize?: 'xsmall' | 'small' | 'regular' | 'large'
  textWeight?: string
}
export const Text = styled.div<TextProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: ${(props) =>
    props.textSize ? props.theme.fontSizes[props.textSize] : props.theme.fontSizes.xsmall};
  font-weight: ${(props) =>
    props.textWeight ? props.textWeight : props.theme.fontWeights.regular};
  margin-left: ${(props) => (props.hasIcon ? '4px' : '0px')};
`
