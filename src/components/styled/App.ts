import styled from '../../StyledComponents'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { darken } from 'polished'

export const Container = styled.div`
    display: grid;
    grid-template-columns: minmax(50px, 250px) auto max(350px);
    grid-template-rows: 50px auto;
    grid-template-areas:
        'header header header'
        'sidebar main focusbar';
    margin: 0px;
    height: 100%;
`
export const HeaderContainer = styled.div`
    grid-area: header;
    display: flex;
    width: 100%;
    z-index: 2;
    box-shadow: 0px 1px 2px ${(props) => darken(0.2, props.theme.colours.headerBackgroundColour)};
`

interface SidebarContainerProps {
    visible: boolean
}

export const SidebarContainer = styled.div<SidebarContainerProps>`
    grid-area: sidebar;
    display: flex;
    width: ${(props) => (props.visible ? '250px' : '50px')};
    min-width: ${(props) => (props.visible ? '250px' : '50px')};
    flex-direction: column;
    transition: all 0.2s ease-in-out;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 0px;
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
`

interface MainContainerProps {
    visible: boolean
}
export const MainContainer = styled.div<MainContainerProps>`
    grid-area: main;
    display: flex;
    flex-direction: column;
    padding: 10px 20px;
    transition: all 0.2s ease-in-out;
    width: 100%;
    align-items: center;
    overflow: scroll;
    background-color: ${(props) => props.theme.colours.backgroundColour};
`

interface FocusContainerProps {
    visible: boolean
}
export const FocusContainer = styled.div<FocusContainerProps>`
    grid-area: focusbar;
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.visible ? '5px 10px' : '0px')};
    width: ${(props) => (props.visible ? 'auto' : '0px')};
    min-width: ${(props) => (props.visible ? '200px' : '0px')};
    transition: all 0.2s ease-in-out;
    align-items: center;
    border: ${(props) => (props.visible ? '1px solid' : 'none')};
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border-color: ${(props) => props.theme.colours.borderColour};
    overflow: scroll;
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
