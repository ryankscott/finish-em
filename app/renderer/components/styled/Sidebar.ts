import styled from '../../StyledComponents'
import { Header } from '../Typography'
import CSS from 'csstype'
import { lighten, darken } from 'polished'

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
interface SectionHeaderProps {
  visible: boolean
}
export const SectionHeader = styled.div<SectionHeaderProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${(props) => (props.visible ? 'flex-start' : 'center')};
  margin: 5px 5px;
  padding: ${(props) => (props.visible ? '20px 5px 5px 5px' : '5px')};
`

export const SubsectionHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 2px 0px;
`

export const HeaderName = styled(Header)`
  padding: 2px 5px;
  margin: 2px;
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
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
`
export const StyledHorizontalRule = styled.hr`
  box-sizing: border-box;
  width: 80%;
  color: ${(props) => props.theme.colours.altTextColour};
`

export const CollapseContainer = styled.div`
  grid-area: collapse;
  display: flex;
  justify-content: center;
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
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
export const AddAreaContainer = styled.div`
  margin-top: 10px;
  display: flex;
  width: 100%;
  justify-content: center;
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
`

type DroppableListProps = {
  isDraggingOver: boolean
  draggableStyle: CSS.Properties
  sidebarVisible: boolean
}
export const DroppableList = styled.div<DroppableListProps>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: inherit;
  padding: ${(props) =>
    !props.sidebarVisible ? '0px' : props.isDraggingOver ? '10px 5px 45px 5px' : '2px 2px'};
  margin: ${(props) => (props.isDraggingOver ? '20px 0px' : '0px')};
  border-radius: 5px;
`

type DraggableItemStyle = {
  isDragging: boolean
  draggableStyle: CSS.Properties
  sidebarVisible: boolean
}

export const DraggableItem = styled.div<DraggableItemStyle>`
    ...draggableStyle;
    display: flex;
    flex-direction: column;
    height: auto;
    user-select: none;
    margin: 0px;
    padding: ${(props) => (!props.sidebarVisible ? '0px' : '0px 5px')};
    border-radius: 5px;
    background: ${(props) =>
      props.isDragging
        ? lighten(0.1, props.theme.colours.altBackgroundColour)
        : props.theme.colours.altBackgroundColour};
    box-shadow: ${(props) =>
      props.isDragging ? '1px 2px 6px ' + darken(0.1, props.theme.colours.altBorderColour) : '0px'};
})

`