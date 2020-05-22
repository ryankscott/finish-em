import styled from 'styled-components'
import Select from 'react-select'

export const Container = styled.div`
    display: flex;
    background-color: ${(props) =>
        props.theme.colours.lightDialogBackgroundColour};
    flex-direction: column;
    padding: 10px 5px;
    z-index: 2;
    position: absolute;
    top: 30px;
    right: 0px;
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    width: 230px;
`

export const ButtonContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-top: 10px;
`

export const Label = styled.div`
    display: flex;
    align-items: center;
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    width: 45%;
    height: 100%;
`

export const Value = styled.div`
    display: flex;
    position: relative;
    align-items: center;
    flex-direction: row;
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    width: 55%;
    height: 100%;
`

export const OptionContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 2px;
    margin: 2px;
    position: relative;
    align-items: center;
    height: 35px;
`

export const Input = styled.input`
    padding: 5px;
    border-radius: 5px;
    border: 1px solid;
    width: 40px;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    border-color: ${(props) => props.theme.colours.borderColour};
`

export const StyledSelect = styled(Select)`
    position: absolute;
    right: 4px;
    top: 2px;
`
