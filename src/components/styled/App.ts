import styled from '../../StyledComponents'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    margin: 0px;
    width: 100%;
    height: 100%;
`

interface SidebarContainerProps {
    visible: boolean
}

export const SidebarContainer = styled.div<SidebarContainerProps>`
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-in-out;
    overflow-y: scroll;
    overflow-x: hidden;
    padding: 0px;
    width: ${(props) => (props.visible ? '300px' : '50px')};
    min-width: ${(props) => (props.visible ? '300px' : '50px')};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
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
    overflow: scroll;
    min-width: 600px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
`

interface FocusContainerProps {
    visible: boolean
}
export const FocusContainer = styled.div<FocusContainerProps>`
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.visible ? '5px' : '0px')};
    width: ${(props) => (props.visible ? '700px' : '0px')};
    min-width: ${(props) => (props.visible ? '80px' : '0px')};
    transition: all 0.2s ease-in-out;
    align-items: center;
    border: 1px solid;
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
