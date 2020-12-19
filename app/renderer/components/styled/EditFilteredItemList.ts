import styled from '../../StyledComponents'

export const DialogContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  padding-bottom: 20px;
  width: 100%;
`
export const DialogHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 5px;
`
export const Setting = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-start;
  padding: 5px 10px;
  width: 100%;
  min-height: 35px;
  align-items: bottom;
`
export const SettingLabel = styled.div`
  display: flex;
  align-self: flex-start;
  color: ${(props) => props.theme.colours.textColour};
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  padding: 7px 5px;
  width: 110px;
  min-width: 110px;
`
export const SettingValue = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 2px 5px;
  width: 100%;
  min-height: 30px;
  align-items: flex-start;
`

export const SelectContainer = styled.div`
  position: relative;
  min-width: 120px;
`

export const HelpButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 5px;
`
export const CloseButtonContainer = styled.div``

export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`

export const SaveButtonContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0px 20px;
  width: 100%;
`
