import styled from '../../StyledComponents'

export const Container = styled.div`
  position: relative;
  border: 1px solid transparent;
  border-radius: 5px;
  &:hover {
    border-color: ${(props) => props.theme.colours.borderColour};
    box-shadow: 0px 1px 2px ${(props) => props.theme.colours.borderColour};
  }
  margin-bottom: 20px;
`

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  right: -32px;
  top: -1px;
  z-index: 3;
  border: 1px solid ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  box-shadow: 1px 0px 4px ${(props) => props.theme.colours.borderColour};
  &:hover {
  }
`
