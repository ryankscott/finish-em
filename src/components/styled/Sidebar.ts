import styled from 'styled-components'
import { NavLink } from 'react-router-dom'
import { lighten } from 'polished'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
    padding: ${(props) => (props.visible ? '10px' : '0px')};
    width: ${(props) => (props.visible ? '250px' : '50px')};
    align-items: ${(props) => (props.visible ? 'none' : 'center')};
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease-in-out;
    height: 100%;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
`
export const StyledNavLink = styled(NavLink)`
    font-size: ${(props) => props.theme.fontSizes.regular};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.altTextColour};
    text-decoration: none;
    margin: 2px;
    padding: 0px 5px;
    outline: none;
    &:active {
        outline: none;
    }
    &:focus {
        outline: none;
    }
    &:hover {
        background-color: ${(props) =>
            lighten(0.05, props.theme.colours.altBackgroundColour)};
    }
`

export const SectionHeader = styled.div`
    display: flex;
    flex-direction: row;
    align-items: first baseline;
    justify-content: space-between;
    margin: 5px 5px;
`

interface FooterProps {
    visible: boolean
}
export const Footer = styled.div<FooterProps>`
    position: absolute;
    bottom: ${(props) => (props.visible ? '30px' : '10px')};
    right: 10px;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`
export const StyledHorizontalRule = styled.hr`
    box-sizing: border-box;
    width: 80%;
    color: ${(props) => props.theme.altTextColour};
`
