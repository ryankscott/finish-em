import styled from '../../StyledComponents'

interface ShortcutContainerProps {
  isOpen: boolean
}
export const Container = styled.div<ShortcutContainerProps>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  background-color: ${(props) => props.theme.colours.dialogBackgroundColour};
  color: ${(props) => props.theme.colours.altTextColour};
  width: 650px;
  height: 600px;
  overflow: auto;
  top: 50%;
  left: calc(50%);
  transform: translate(-50%, -50%);
  padding: 0px 20px;
  z-index: 99;
  border: 1px solid;
  border-color: ${(props) => props.theme.colours.borderColour};
  box-shadow: 0px 1px 4px ${(props) => props.theme.colours.borderColour};
  border-radius: 5px;
  scrollbar-width: thin;
`
export const CloseButtonContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
`
export const ShortcutsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 50px;
`
