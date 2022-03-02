import styled from '../../../StyledComponents'
import { darken } from 'polished'

interface StyledFilterBoxProps {
  focus: string
  error: string
}
export const StyledFilterBox = styled.div<StyledFilterBoxProps>`
  overflow-y: hidden;
  width: 100%;
  height: 28px;
  padding: 0px;
  margin-bottom: 0px;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  line-height: 20px;
  color: ${(props) => props.theme.colours.textColour};
  vertical-align: middle;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  box-shadow: 0px 0px 3px
    ${(props) =>
      props.focus
        ? props.theme.colours.primaryColour
        : props.error
        ? props.theme.colours.errorColour
        : 'transparent'};
  transition: border linear 0.2s, box-shadow linear 0.2s;

  &:hover {
    background-color: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  }
`
