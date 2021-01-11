import styled from '../../StyledComponents'
import { darken } from 'polished'

export const Suggestion = styled.li`
  margin: 2px 0px;
  padding: 4px 4px;
  background-color: transparent;
  color: ${(props) => props.theme.colours.textColour};
  &:hover {
    background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  }
  &:active {
    background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  }
`
export const Error = styled.code`
  background: ${(props) => props.theme.colours.backgroundColour};
  border: none;
  margin: 0;
  margin-top: -4px;
  padding: 0;
  color: red;
  padding-left: 5px;
`

export const FilterContainer = styled.div`
  width: 465px;
  margin: 0px 5px;
`
