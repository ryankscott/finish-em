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
    padding: ${(props) =>
        props.iconOnly
            ? '5px'
            : props.spacing === 'compact'
            ? '5px 8px'
            : '8px 10px'};
    width: ${(props) => (props.width ? props.width : 'auto')};
    height: ${(props) => (props.height ? props.height : 'auto')};
    margin: 2px;
    border-radius: 5px;
    border: none;
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

interface IconProps {
    iconPosition: 'after' | 'before'
}
export const Icon = styled.div<IconProps>`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding-left: ${(props) => (props.iconPosition == 'after' ? '5px' : '0px')}
    padding-right: ${(props) =>
        props.iconPosition == 'before' ? '5px' : '0px'}
`

interface TextProps {
    hasIcon: boolean
    textSize?: 'xsmall' | 'small' | 'regular' | 'large'
}
export const Text = styled.div<TextProps>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-size: ${(props) =>
        props.textSize
            ? props.theme.fontSizes[props.textSize]
            : props.theme.fontSizes.xsmall};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    margin-left: ${(props) => (props.hasIcon ? '4px' : '0px')};
`
