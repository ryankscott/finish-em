import { Header1, Header2, Paragraph } from '../Typography'
import { TwitterPicker } from 'react-color'
import styled from '../../StyledComponents'
import { darken } from 'polished'

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`

export const SettingsSidebar = styled.div`
  display: flex;
  flex-direction: column;
  width: 280px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  padding: 20px 0px;
  height: 100%;
  box-shadow: 0px 0px 4px ${(props) => darken(0.2, props.theme.colours.borderColour)};
`

export const SettingsSidebarHeader = styled(Header1)`
  padding: 10px 10px;
  font-size: ${(props) => props.theme.fontSizes.large};
  font-weight: ${(props) => props.theme.fontWeights.bold};
`

type SettingsCategoryHeaderProps = {
  active: boolean
}

export const SettingsCategoryHeader = styled.div<SettingsCategoryHeaderProps>`
  color: ${(props) => props.theme.colours.textColour};
  font-size: ${(props) => props.theme.fontSizes.medium};
  font-weight: ${(props) => props.theme.fontWeights.regular};
  background-color: ${(props) =>
    props.active
      ? props.theme.colours.focusBackgroundColour
      : props.theme.colours.backgroundColour};
  padding: 5px 15px;
  &:hover {
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    cursor: pointer;
  }
`

export const SettingsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 100%;
`

export const SettingsCategory = styled.div`
  padding: 10px;
  margin: 20px 10px 20px 10px;
`

export const SettingsBodyHeader = styled(Header1)`
  padding: 10px 5px;
  font-size: ${(props) => props.theme.fontSizes.large};
  font-weight: ${(props) => props.theme.fontWeights.bold};
`

export const Setting = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  padding: 5px 10px;
  width: 100%;
  height: 30px;
  align-items: center;
`
export const SettingLabel = styled(Paragraph)`
  color: ${(props) => props.theme.colours.textColour};
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  width: 180px;
`
interface PopoverProps {
  top: number
  left?: number
}
export const Popover = styled.div<PopoverProps>`
  z-index: 99;
  position: absolute;
  top: ${(props) => {
    return Math.round(props.top) + 'px'
  }};
  left: ${(props) => {
    return Math.round(props.left) + 'px'
  }};
`
export const LabelName = styled.div`
  font-size: ${(props) => props.theme.fontSizes.xxsmall};
  padding: 2px;
  padding-left: 10px;
  &:hover {
    font-weight: ${(props) => props.theme.fontWeights.bold};
    cursor: pointer;
  }
`

export const LabelContainer = styled.div`
  display: flex;
  width: 250px;
  justify-content: space-between;
  align-items: center;
  height: auto;
  background-color: ${(props) => props.theme.colours.backgroundColour};
`

export const ButtonContainer = styled.div`
  width: 185px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
`
