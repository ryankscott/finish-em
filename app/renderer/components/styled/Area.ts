import styled from 'styled-components'

export const AreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 700px;
  margin: 20px 0px 5px 0px;
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
  z-index: 9999;

  .emoji-mart {
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
`

export const ProjectContainer = styled.div`
  position: relative;
  transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
  max-height: 200px;
  max-width: 650px;
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.regular};
  display: grid;
  margin: 1px 0px;
  grid-template-columns: 35px minmax(180px, auto) auto;
  grid-auto-rows: minmax(20px, auto) minmax(20px, auto);
  grid-template-areas:
    'donut name description'
    'donut startAt endAt';
  padding: 5px;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  :focus {
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }
  :active {
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }
  :hover {
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 0px auto;
    height: 1px;
    width: calc(100% - 10px);
    border-bottom: 1px solid;
    border-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }
`

export const ProjectName = styled.div`
  display: flex;
  justify-content: flex-start;
  grid-area: name;
  color: ${(props) => props.theme.colours.textColour};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  font-size: ${(props) => props.theme.fontSizes.small};
`
export const ProjectDescription = styled.div`
  grid-area: description;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
`
export const ProjectStartAt = styled.div`
  grid-area: startAt;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  color: ${(props) => props.theme.colours.disabledTextColour};
`
export const ProjectEndAt = styled.div`
  grid-area: endAt;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  color: ${(props) => props.theme.colours.disabledTextColour};
`
