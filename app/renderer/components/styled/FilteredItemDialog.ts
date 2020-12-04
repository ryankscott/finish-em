import styled from '../../StyledComponents'
import { Paragraph } from '../Typography'

export const DialogContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  margin: 2px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  width: 510px;
  padding: 5px 5px;
  padding-bottom: 10px;
  z-index: 2;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  top: 120px;
  right: 3px;
`
export const DialogHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 5px;
  padding-bottom: 10px;
`
export const DialogName = styled(Paragraph)`
  font-size: ${(props) => props.theme.fontSizes['regular']};
  font-weight: ${(props) => props.theme.fontWeights['regular']};
  padding: 5px 5px;
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
export const CloseButtonContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`

export const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: space-between;
`
