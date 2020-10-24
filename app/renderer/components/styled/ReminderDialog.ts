import styled from 'styled-components'
import { Paragraph } from '../Typography'

export const Container = styled.div`
  z-index: 2;
  position: absolute;
  top: 30px;
  min-width: 160px;
  right: 138px;
  color: ${(props) => props.theme.colours.textColour};
  background-color: ${(props) => props.theme.colours.backgroundColour};
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  padding: 5px;
  box-shadow: 0px 1px 4px ${(props) => props.theme.colours.borderColour};
`
export const ReminderHeader = styled(Paragraph)`
  padding-left: 10px;
`

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 5px;
`
export const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 2px;
`

export const ReminderContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 25px;
  padding-left: 10px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  &:hover {
    font-weight: ${(props) => props.theme.fontWeights.bold};
    background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    cursor: pointer;
  }
  font-size: ${(props) => props.theme.fontSizes.xxsmall};
  font-family: ${(props) => props.theme.font.sansSerif};
  color: ${(props) => props.theme.colours.textColour};
`
