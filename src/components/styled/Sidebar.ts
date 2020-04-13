import styled from 'styled-components'
import { NavLink } from 'react-router-dom'

interface ContainerProps {
  visible: boolean
}
export const Container = styled.div<ContainerProps>`
  opacity: ${(props) => (props.visible ? '1' : '0')};
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
  padding: ${(props) => (props.visible ? '20px' : '0px')};
  width: ${(props) => (props.visible ? '250px' : '0px')};
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
  margin: 5px 0px 5px 10px;
  outline: none;
  &:active: {
    outline: none;
  }
  &:focus: {
    outline: none;
  }
`

export const SectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: first baseline;
  justify-content: space-between;
`
