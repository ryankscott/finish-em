import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  background-color: ${(props) => props.theme.colours.dialogBackgroundColour};
  flex-direction: column;
  padding: 10px 10px;
  z-index: 99;
  position: absolute;
  top: 30px;
  right: 0px;
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  width: 240px;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
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
  padding: 6px;
  margin: 0px 2px;
  border-radius: 5px;
  border: 1px solid;
  width: 40px;
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.xxsmall};
  font-weight: ${(props) => props.theme.fontWeights.regular};
  border-color: ${(props) => props.theme.colours.borderColour};
`
