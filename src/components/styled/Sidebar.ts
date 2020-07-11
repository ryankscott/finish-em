import styled from 'styled-components'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    align-items: ${(props) => (props.visible ? 'none' : 'center')};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease-in-out;
    width: 100%;
    height: 100vh;
    padding: 2px;
    background: ${(props) => props.theme.colours.altBackgroundColour};
`
export const BodyContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
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

interface ViewContainerProps {
    collapsed: boolean
}
export const ViewContainer = styled.div<ViewContainerProps>`
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: auto;
    margin: 0px;
    padding: 0px;
`
export const AddProjectContainer = styled.div`
    padding-top: 5px;
    display: flex;
    width: 100%;
    justify-content: center;
`
