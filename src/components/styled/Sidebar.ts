import styled from '../../StyledComponents'
import { Header1, Header } from '../Typography'
import CSS from 'csstype'
import { lighten } from 'polished'

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

interface SubsectionHeaderProps {
    visible: boolean
}
export const SubsectionHeader = styled.div<SubsectionHeaderProps>`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: '0px 5px';
    padding-left: 10px;
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

interface DroppableListProps {
    isDragging: boolean
    draggableStyle: CSS.Properties
}
export const DroppableList = styled.div``

export const DroppableListStyle = (isDraggingOver: boolean, theme): CSS.Properties => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    background: isDraggingOver ? lighten(0.1, theme.colours.altBackgroundColour) : 'inherit',
    padding: isDraggingOver ? '10px 5px' : '5px 5px',
    paddingBottom: isDraggingOver ? '45px' : '5px',
    borderRadius: '5px',
})

export const DraggableItem = styled.div``

export const DraggableItemStyle = (isDragging: boolean, draggableStyle, theme): CSS.Properties => ({
    ...draggableStyle,
    display: 'flex',
    flexDirection: 'row',
    height: 'auto',
    userSelect: 'none',
    margin: '0px',
    padding: '0px 5px',
    borderRadius: '5px',
    // change background colour if dragging
    background: isDragging
        ? theme.colours.focusAltDialogBackgroundColour
        : theme.colours.altBackgroundColour,
})
