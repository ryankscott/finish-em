import styled from '../../StyledComponents'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { darken } from 'polished'

export const Container = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: 50px auto;
  grid-template-areas:
    'header'
    'body';
  margin: 0px;
  height: 100%;
  min-width: 500px;
  transition: all 0.2s ease-in-out;
`
export const HeaderContainer = styled.div`
  grid-area: header;
  display: flex;
  width: 100%;
  z-index: 2;
  box-shadow: 0px 1px 2px ${(props) => darken(0.2, props.theme.colours.headerBackgroundColour)};
`

export const BodyContainer = styled.div`
  grid-area: body;
  display: flex;
  flex-direction: row;
  width: 100%;
  overflow-y: scroll;
  min-width: 500px;
  transition: all 0.2s ease-in-out;
`

interface SidebarContainerProps {
  visible: boolean
}

export const SidebarContainer = styled.div<SidebarContainerProps>`
  display: flex;
  width: ${(props) => (props.visible ? '250px' : '50px')};
  min-width: ${(props) => (props.visible ? '250px' : '50px')};
  flex-direction: column;
  transition: all 0.2s ease-in-out;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 0px;
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
  border-right: 1px solid ${(props) => props.theme.colours.borderColour};
`

interface MainContainerProps {
  visible: boolean
}
export const MainContainer = styled.div<MainContainerProps>`
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  transition: all 0.2s ease-in-out;
  width: 100%;
  align-items: center;
  overflow-y: scroll;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  min-width: 500px;
`

interface FocusContainerProps {
  visible: boolean
}
export const FocusContainer = styled.div<FocusContainerProps>`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.visible ? '5px' : '0px')};
  min-width: ${(props) => (props.visible ? '350px' : '0px')};
  width: ${(props) => (props.visible ? '350px' : '0px')};
  transition: all 0.2s ease-out;
  align-items: center;
  border: ${(props) => (props.visible ? '1px solid' : 'none')};
  background-color: ${(props) => props.theme.colours.backgroundColour};
  border-color: ${(props) => props.theme.colours.borderColour};
  overflow-y: scroll;
  overflow-x: hidden;
  box-shadow: 0px 1px 4px ${(props) => props.theme.colours.borderColour};
`

export const StyledToastContainer = styled(ToastContainer).attrs((props) => ({
  className: 'toast-container',
  toastClassName: 'toast',
  bodyClassName: 'body',
  progressClassName: 'progress',
}))`
  /* .toast-container */
  border-radius: 5px;
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.small};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  /* .toast is passed to toastClassName */
  .toast {
    padding: 5px 5px;
    border: 0px;
    border-radius: 5px;
  }

  /* .body is passed to bodyClassName */
  .body {
  }

  /*
    .progress is passed to progressClassName */
  .Toastify__progress-bar--dark {
    background: linear-gradient(
      to right,
      ${(props) => props.theme.colours.primaryColour},
      ${(props) => props.theme.colours.secondaryColour},
      ${(props) => props.theme.colours.tertiaryColour},
      ${(props) => props.theme.colours.quarternaryColour},
      ${(props) => props.theme.colours.penternaryColour}
    );
  }
`
