import styled from '../../StyledComponents'

export const Container = styled.div`
  width: 100%;
  display: grid;
  align-items: center;
  grid-template-areas: 'icon . search command feedback help';
  grid-template-columns: repeat(3, 1fr) 30px 30px 30px;
  grid-template-rows: auto;
  grid-area: header;
  color: ${(props) => props.theme.colours.headerTextColour};
  z-index: 2;
  background-color: ${(props) => props.theme.colours.headerBackgroundColour};
  padding: 2px 20px;
`

export const ShortcutIcon = styled.div`
  grid-area: help;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px;
  :hover {
    cursor: pointer;
  }
`

export const CommandIcon = styled.div`
  grid-area: command;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px;
  :hover {
    cursor: pointer;
  }
`

export const FeedbackIcon = styled.div`
  grid-area: feedback;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px;
  :hover {
    cursor: pointer;
  }
`

export const SelectContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  grid-area: search;
  padding: 0px 5px;
`

export const IconContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  grid-area: icon;
  padding: 0px 10px;
`
