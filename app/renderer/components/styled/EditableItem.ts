import styled from 'styled-components'

export const Icon = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-self: center;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.large};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    padding: 0px 2px;
    padding-left: 5px;
    text-align: center;
    vertical-align: middle;
    color: ${(props) => props.theme.colours.disabledTextColour};
`

interface ContainerProps {
    hideIcon: boolean
    subtle?: boolean
}
export const Container = styled.div<ContainerProps>`
    display: flex;
    flex-direction: row;
    border: 1px solid;
    border-radius: 5px;
    opacity: ${(props) => (props.subtle ? 0.8 : 1)};
    background-color: ${(props) =>
        props.subtle ? 'inherit' : props.theme.colours.backgroundColour};
    border-color: ${(props) => props.theme.colours.borderColour};
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.small};
    margin: 0px;
    padding: 0px;
`
