import styled from 'styled-components'

export const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px;
  padding: 5px;
  margin-bottom: 10px;
`

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`
export const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: flex-end;
`
export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0px 5px;
`
export const Dialog = styled.div`
  position: absolute;
  top: 40px;
  right: 0px;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  box-shadow: 0px 1px 4px ${(props) => props.theme.colours.borderColour};
  z-index: 99;
`

export const CloseButton = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`
