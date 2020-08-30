import styled from 'styled-components'
import { Paragraph } from '../Typography'
import { TwitterPicker } from 'react-color'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    margin: 20px 20px;
    padding: 20px 20px;
    width: 100%;
`
export const SettingsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 10px;
    width: 100%;
`

export const SettingsCategory = styled.div`
    padding: 5px;
`

export const SettingsCategoryHeader = styled(Paragraph)`
    color: ${(props) => props.theme.colours.textColour};
    font-size: ${(props) => props.theme.fontSizes.large};
    font-weight: ${(props) => props.theme.fontWeights.bold};
    padding: 10px 5px;
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
    height: 25px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
`
export const StyledTwitterPicker = styled(TwitterPicker)`
    background-color: ${(props) => props.theme.colours.backgroundColour + ' !important'};
    border: 1px solid !important;
    border-radius: 5px !important;
    border-color: ${(props) => props.theme.colours.borderColour + ' !important'};

    & > div {
        border-color: ${(props) =>
            `transparent transparent ${props.theme.colours.backgroundColour} !important`};
    }
`
