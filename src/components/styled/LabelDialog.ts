import styled from 'styled-components'
import { Paragraph } from '../Typography'
import CSS from 'csstype'
import { transparentize } from 'polished'

export const Container = styled.div`
    z-index: 2;
    position: absolute;
    top: 0px;
    min-width: 180px;
    right: 158px;
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    padding: 5px;
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

interface LabelNameProps {
    colour: CSS.Color
}
export const LabelName = styled.div<LabelNameProps>`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    color: ${(props) => props.theme.colours.textColour};
    padding: 2px;
    padding-left: 10px;
    &:hover {
        font-weight: ${(props) => props.theme.fontWeights.bold};
        cursor: pointer;
    }
`
interface LabelContainerProps {
    colour: CSS.Color
}
export const LabelContainer = styled.div<LabelContainerProps>`
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 25px;
    background-color: ${(props) =>
        props.colour ? transparentize(0.8, props.colour) : props.theme.colours.backgroundColour};
    &:hover {
        font-weight: ${(props) => props.theme.fontWeights.bold};
        cursor: pointer;
    }
`
