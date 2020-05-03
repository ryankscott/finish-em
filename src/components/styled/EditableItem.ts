import styled, { keyframes } from 'styled-components'
import { headShake } from 'react-animations'

export const Icon = styled.div`
    flex-direction: row;
    justify-content: center;
    align-self: center;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.large};
    background-color: whitesmoke;
    padding: 0px 10px;
    text-align: center;
    vertical-align: middle;
    color: ${(props) => props.theme.colours.disabledTextColour};
`

interface ValidationBoxProps {
    animate: boolean
    hideIcon: boolean
    valid: boolean
}
export const headShakeAnimation = keyframes`${headShake}`
export const ValidationBox = styled.div<ValidationBoxProps>`
    animation: 1s ${(props) => (props.animate ? headShakeAnimation : 'none')};
    background-color: whitesmoke;
    display: flex;
    flex-direction: row;
    border: 1px solid;
    border-radius: 5px;
    border-color: ${(props) =>
        props.valid
            ? props.theme.colours.borderColour
            : props.theme.colours.errorColour};
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    margin: 0px;
    padding-left: ${(props) => (props.hideIcon ? '10px' : '0px')};
`
