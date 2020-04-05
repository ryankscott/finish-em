interface StyledProps {
    compact: boolean;
}
export const StyledButton = styled.button<StyledProps>`
  background-color: ${props => props.theme.backgroundColour};
  color: ${props => props.theme.colour};
  font-size: ${props => props.theme.fontSizes.xsmall};
  padding: 2px 5px;
  height: ${props => (props.compact ? "25px" : "30px")};
  width: ${props => (props.compact ? "60px" : "90px")};
  margin: 2px;
  border-radius: 5px;
  border: 1px solid;
  border-color: ${props => props.theme.borderColour};
  text-align: center;
  &:hover {
    background-color: ${props => props.theme.hoverBackgroundColour};
    border-color: ${props => props.theme.hoverBackgroundColour};
    cursor: pointer;
  }
`;
