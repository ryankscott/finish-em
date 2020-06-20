import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    position: relative;
    z-index: 0;
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
    align-items: ${(props) => (props.visible ? 'none' : 'center')};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease-in-out;
    width: 100%;
    height: 100vh;
    padding: 2px;
`
export const BodyContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`

export const StyledNavLink = styled(NavLink)`
    font-size: ${(props) => props.theme.fontSizes.regular};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.altTextColour};
    text-decoration: none;
    margin: 1px 2px;
    padding: 0px 5px;
    outline: none;
    &:active {
        outline: none;
    }
    &:focus {
        outline: none;
    }
    &:hover {
        background-color: ${(props) => props.theme.colours.focusAltDialogBackgroundColour};
    }
`

export const SectionHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: first baseline;
    justify-content: space-between;
    margin: 5px 5px;
    padding: 5px;
`

interface FooterProps {
    visible: boolean
}
export const Footer = styled.div<FooterProps>`
    margin-right: ${(props) => (props.visible ? '2px' : '0px')};
    padding: 2px;
    display: grid;
    justify-content: center;
    width: 100%;
    grid-template-columns: ${(props) => (props.visible ? 'repeat(5, 1fr)' : '100%')};
    grid-template-areas: ${(props) =>
        props.visible
            ? `'settings settings settings settings settings collapse'`
            : `'settings'
'collapse'`};
    flex-direction: row;
    justify-content: space-between;
`
export const StyledHorizontalRule = styled.hr`
    box-sizing: border-box;
    width: 80%;
    color: ${(props) => props.theme.altTextColour};
`

export const CollapseContainer = styled.div`
    grid-area: collapse;
    display: flex;
    justify-content: center;
`

interface SettingsContainerProps {
    collapsed: boolean
}
export const SettingsContainer = styled.div<SettingsContainerProps>`
    grid-area: settings;
    width: 100%;
    display: flex;
    justify-content: ${(props) => (props.collapsed ? 'center' : 'flex-start')};
`
