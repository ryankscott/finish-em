import styled from 'styled-components'

export const StyledInput = styled.input`
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    height: 30px;
    margin: 2px 5px;
    padding: 2px 5px;
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-radius: 2px;
    border-color: ${(props) => props.theme.colours.borderColour};
`
export const HeaderContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: flex-end;
`

export const BodyContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px 2px;
`
export const Container = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 190px;
    padding: 0px 0px;
    margin: 0px 2px;
`
