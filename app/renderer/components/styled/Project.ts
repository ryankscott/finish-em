import styled from '../../StyledComponents'

export const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  margin: 20px 0px 5px 0px;
`

export const AddProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 5px 0px;
  width: 100%;
`

export const StaleContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`

export const HeaderContainer = styled.div`
  display: grid;
  grid-auto-rows: 60px 40px;
  grid-template-columns: 120px 1fr;
  grid-template-areas:
    'EMOJI  DESC  '
    'EMOJI PROGRESS ';
  align-items: center;
  padding: 5px 0px;
`

export const EmojiContainer = styled.div`
  grid-area: EMOJI;
  display: flex;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  font-size: 70px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  margin: 0px 10px;
  cursor: pointer;
`

export const ProgressContainer = styled.div`
  grid-area: PROGRESS;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`
export const DescriptionContainer = styled.div`
  grid-area: DESC;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
`

export const EmojiPickerWrapper = styled.div`
  display: flex;
  position: relative;
  z-index: 9;

  .emoji-mart {
    z-index: 10;
    position: absolute;
    font-family: ${(props) => props.theme.font.sansSerif};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    box-shadow: 1px 0px 4px ${(props) => props.theme.colours.borderColour};
  }

  .emoji-mart-search input {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
  }

  .emoji-mart-category-label {
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    background-color: ${(props) => props.theme.colours.backgroundColour};
  }

  .emoji-mart-category-label span {
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    background-color: ${(props) => props.theme.colours.backgroundColour};
  }

  .emoji-mart-preview-name {
    font-size: ${(props) => props.theme.fontSizes.xsmall};
  }
`
