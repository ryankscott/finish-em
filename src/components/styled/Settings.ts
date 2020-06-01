import styled from 'styled-components'
import { Paragraph } from '../Typography'

export const Container = styled.div``

export const Setting = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 5px 5px;
    width: 100%;
    height: 25px;
    align-items: bottom;
    justify-content: center;
`
export const SettingLabel = styled(Paragraph)`
    color: ${(props) => props.theme.colours.altTextColour};
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    margin: 0px 10px;
    margin-right: 15px;
    min-width: 80px;
`

export const SettingsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 10px 5px;
    margin-right: 0px;
`
