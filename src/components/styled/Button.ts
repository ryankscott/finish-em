import styled from "styled-components";

interface StyledProps {
  width: number,
  height: number,
  spacing: "compact" | "default"
  hasChildren: boolean;
}
export const StyledButton = styled.button<StyledProps>`
  background-color: ${props => props.theme.backgroundColour};
  color: ${props => props.theme.colour};
  font-size: ${props => props.theme.fontSizes.xsmall};  
  padding: ${props => !props.hasChildren ? "2px" : props.spacing == "compact" ? "2px 5px" : "5px 8px"};
  height: ${props => (props.width ? props.width + "px" : "auto")};
  width: ${props => props.height ? props.height + "px" : "auto"};
  margin: 2px;
  border: none;
  border-radius: ${props => props.hasChildren ? "5px" : "50%"};
  border-color: ${props => props.theme.borderColour};
  text-align: center;
  &:hover {
    background-color: ${props => props.theme.hoverBackgroundColour};
    border-color: ${props => props.theme.hoverBackgroundColour};
    cursor: pointer;
  }
`;
export const Contents = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
`;

export const Icon = styled.div`
padding: 2px;
`;

export const Text = styled.div`
padding: 2px;
`;
