import styled from 'styled-components'
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
    min-width: 320px;
    padding: 5px 5px;
    padding-bottom: 20px;
    z-index: 2;
    left: 0px;
    top: 23px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
`
export const DialogHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-bottom: 10px;
`
export const DialogName = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes['regular']};
    font-weight: ${(props) => props.theme.fontWeights['regular']};
    padding: 5px 5px;
`

export const Setting = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 2px 10px;
    width: 100%;
    min-height: 30px;
    align-items: bottom;
`
export const SettingLabel = styled.div`
    display: flex;
    align-self: center;
    color: ${(props) => props.theme.colours.textColour};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    width: 120px;
`
export const SettingValue = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 2px 5px;
    width: 100%;
    min-height: 30px;
    align-items: center;
`
