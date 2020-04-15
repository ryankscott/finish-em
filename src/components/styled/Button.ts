/* eslint-disable no-nested-ternary */
import styled from 'styled-components'

interface StyledProps {
    width: string
    height: string
    spacing: 'compact' | 'default'
    iconOnly: boolean
}

export const StyledButton = styled.button<StyledProps>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: ${(props) => props.theme.backgroundColour};
    color: ${(props) => props.theme.colour};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    padding: ${(props) =>
        props.iconOnly
            ? '2px'
            : props.spacing === 'compact'
            ? '5px 8px'
            : '8px 10px'};
    width: ${(props) => (props.width ? props.width : 'auto')};
    height: ${(props) => (props.height ? props.height : 'auto')};
    margin: 2px;
    border: none;
    border-radius: 5px;
    border-color: ${(props) => props.theme.borderColour};
    text-align: center;
    &:hover {
        background-color: ${(props) => props.theme.hoverBackgroundColour};
        border-color: ${(props) => props.theme.hoverBackgroundColour};
        cursor: pointer;
    }
`
export const Contents = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: 0px;
`

export const Icon = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
`

interface TextProps {
    hasIcon: boolean
}
export const Text = styled.div<TextProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    margin-left: ${(props) => (props.hasIcon ? '4px' : '0px')};
`
