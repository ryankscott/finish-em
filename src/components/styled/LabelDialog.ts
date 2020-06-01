import styled from 'styled-components'
import { Paragraph } from '../Typography'
import CSS from 'csstype'
import { darken } from 'polished'

export const Container = styled.div`
    position: absolute;
    top: 0px;
    min-width: 140px;
    right: 158px;
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    padding: 2px;
`
export const LabelHeader = styled(Paragraph)`
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

interface LabelProps {
    colour: CSS.Color
}
export const LabelContainer = styled.div<LabelProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 25px;
    background-color: ${(props) => props.colour};
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    color: ${(props) => props.theme.colours.altTextColour};
    padding: 2px;
    padding-left: 5px;
    &:hover {
        background-color: ${(props) => darken(0.1, props.colour)};
        cursor: pointer;
    }
`
