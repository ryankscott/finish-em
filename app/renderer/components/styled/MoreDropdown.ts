import styled from 'styled-components'

export const DialogContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    min-width: 140px;
    padding: 5px 0px;
    z-index: 9;
    right: 0px;
    box-shadow: 0px 1px 4px ${(props) => props.theme.colours.borderColour};
`
export const Icon = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 8px;
`

export const Option = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    padding: 5px 5px;
    border-radius: 2px;
    :hover {
        background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) => props.theme.colours.textColour};
    z-index: 10;
`