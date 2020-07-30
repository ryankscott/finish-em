import React, { ReactElement } from 'react'
import styled, { ThemeProvider } from '../StyledComponents'
import { connect } from 'react-redux'
import { useHistory, NavLink, NavLinkProps } from 'react-router-dom'

import { themes } from '../theme'
import {
    createProject,
    addComponent,
    toggleSidebar,
    reorderProject,
    addView,
    setProjectArea,
} from '../actions'
import { Projects, Views, ItemIcons, Areas } from '../interfaces'
import {
    HeaderName,
    Container,
    SectionHeader,
    Footer,
    StyledHorizontalRule,
    BodyContainer,
    CollapseContainer,
    ViewContainer,
    AddAreaContainer,
    DroppableList,
    DroppableListStyle,
    DraggableItem,
    DraggableItemStyle,
    SubsectionHeader,
} from './styled/Sidebar'
import Button from './Button'
import { createShortProjectName } from '../utils'
import { Uuid } from '@typed/uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid/v4'

import { Icons } from '../assets/icons'

import { createArea } from '../actions/area'

interface StyledLinkProps extends NavLinkProps {
    sidebarVisible: boolean
}

export const StyledLink = styled(({ sidebarVisible, ...rest }: StyledLinkProps) => (
    <NavLink {...rest} />
))`
    display: flex;
    box-sizing: border-box;
    justify-content: ${(props) => (props.sidebarVisible ? 'flex-start' : 'center')};
    font-size: ${(props) =>
        props.sidebarVisible ? props.theme.fontSizes.xsmall : props.theme.fontSizes.regular};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.altTextColour};
    border-radius: 5px;
    margin: 1px 0px;
    text-decoration: none;
    padding: 5px 15px;
    outline: none;
    :active {
        outline: none;
    }
    :focus {
        outline: none;
    }
    :hover {
        background-color: ${(props) => props.theme.colours.focusAltDialogBackgroundColour};
    }
    svg {
        margin-right: ${(props) => (props.sidebarVisible ? '5px' : '0px')};
    }
`
interface ProjectLinkProps {
    sidebarVisible: boolean
}
export const ProjectLink = styled(StyledLink)<ProjectLinkProps>`
    width: 100%;
    padding-left: ${(props) => (props.sidebarVisible ? '25px' : '15px')};
`
interface AreaLinkProps {
    sidebarVisible: boolean
}
export const AreaLink = styled(StyledLink)<AreaLinkProps>`
    width: 100%;
`

interface StateProps {
    projects: Projects
    areas: Areas
    sidebarVisible: boolean
    theme: string
    views: Views
}
interface DispatchProps {
    toggleSidebar: () => void
    createProject: (id: Uuid, name: string, description: string, areaId: string) => void
    reorderProject: (id: Uuid, destinationId: Uuid) => void
    setProjectArea: (id: Uuid, areaId: string) => void
    createArea: (id: Uuid, name: string, description: string) => void
}

const generateSidebarContents = (
    sidebarVisible: boolean,
    iconName: string,
    text: string,
): React.ReactElement => {
    if (sidebarVisible) {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                {Icons[iconName](16, 16)}
                {text}
            </div>
        )
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>{Icons[iconName](20, 20)}</div>
    )
}

type SidebarProps = StateProps & DispatchProps
const Sidebar = (props: SidebarProps): ReactElement => {
    const theme = themes[props.theme]
    const history = useHistory()

    return (
        <ThemeProvider theme={theme}>
            <Container visible={props.sidebarVisible}>
                <BodyContainer>
                    <SectionHeader visible={props.sidebarVisible}>
                        {Icons['view'](22, 22, themes[props.theme].colours.primaryColour)}
                        {props.sidebarVisible && <HeaderName>Views</HeaderName>}
                    </SectionHeader>
                    <ViewContainer collapsed={!props.sidebarVisible}>
                        <StyledLink
                            sidebarVisible={props.sidebarVisible}
                            to="/inbox"
                            activeStyle={{
                                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                            }}
                        >
                            {generateSidebarContents(props.sidebarVisible, 'inbox', 'Inbox')}
                        </StyledLink>
                        <StyledLink
                            sidebarVisible={props.sidebarVisible}
                            to="/dailyAgenda"
                            activeStyle={{
                                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                            }}
                        >
                            {generateSidebarContents(
                                props.sidebarVisible,
                                'calendar',
                                'Daily Agenda',
                            )}
                        </StyledLink>
                        {Object.values(props.views.order).map((v) => {
                            const view = props.views.views[v]
                            if (view.type != 'custom') return
                            return (
                                <StyledLink
                                    sidebarVisible={props.sidebarVisible}
                                    key={view.id}
                                    to={`/views/${view.id}`}
                                    activeStyle={{
                                        backgroundColor:
                                            theme.colours.focusAltDialogBackgroundColour,
                                    }}
                                >
                                    {generateSidebarContents(
                                        props.sidebarVisible,
                                        view.icon,
                                        view.name,
                                    )}
                                </StyledLink>
                            )
                        })}
                        {!props.sidebarVisible && <StyledHorizontalRule />}
                    </ViewContainer>
                    <SectionHeader visible={props.sidebarVisible}>
                        {Icons['area'](22, 22, themes[props.theme].colours.primaryColour)}
                        {props.sidebarVisible && <HeaderName>Areas</HeaderName>}
                    </SectionHeader>

                    <DragDropContext
                        onDragEnd={(e) => {
                            props.setProjectArea(e.draggableId, e.destination.droppableId)
                            props.reorderProject(
                                e.draggableId,
                                props.projects.order[e.destination.index],
                            )
                        }}
                    >
                        {Object.values(props.areas.order).map((a: Uuid, index) => {
                            const area = props.areas.areas[a]
                            return (
                                <div key={a}>
                                    {props.sidebarVisible && (
                                        <SubsectionHeader visible={props.sidebarVisible}>
                                            <AreaLink
                                                sidebarVisible={props.sidebarVisible}
                                                to={`/areas/${area.id}`}
                                                activeStyle={{
                                                    backgroundColor:
                                                        theme.colours
                                                            .focusAltDialogBackgroundColour,
                                                }}
                                            >
                                                {area.name}
                                            </AreaLink>
                                            <Button
                                                type="subtle"
                                                icon="add"
                                                iconColour={'white'}
                                                onClick={() => {
                                                    const projectId = uuidv4()
                                                    props.createProject(
                                                        projectId,
                                                        'New Project',
                                                        '',
                                                        a,
                                                    )
                                                    history.push('/projects/' + projectId)
                                                }}
                                            />
                                        </SubsectionHeader>
                                    )}
                                    <Droppable droppableId={a} type="PROJECT">
                                        {(provided, snapshot) => (
                                            <DroppableList
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                style={DroppableListStyle(
                                                    snapshot.isDraggingOver,
                                                    theme,
                                                )}
                                            >
                                                {Object.values(props.projects.order).map(
                                                    (p: Uuid, index) => {
                                                        // Don't render the inbox here
                                                        if (p == '0') return
                                                        const project = props.projects.projects[p]
                                                        // Only render those in that area
                                                        if (project.areaId != a) return
                                                        const pathName = '/projects/' + p
                                                        //
                                                        return (
                                                            <Draggable
                                                                key={p}
                                                                draggableId={p}
                                                                index={index}
                                                            >
                                                                {(provided, snapshot) => (
                                                                    <DraggableItem
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        key={'container-' + p}
                                                                        style={DraggableItemStyle(
                                                                            snapshot.isDragging,
                                                                            provided.draggableProps
                                                                                .style,
                                                                            theme,
                                                                        )}
                                                                    >
                                                                        <ProjectLink
                                                                            sidebarVisible={
                                                                                props.sidebarVisible
                                                                            }
                                                                            key={p}
                                                                            to={pathName}
                                                                            activeStyle={{
                                                                                backgroundColor:
                                                                                    theme.colours
                                                                                        .focusAltDialogBackgroundColour,
                                                                            }}
                                                                        >
                                                                            {props.sidebarVisible
                                                                                ? project.name
                                                                                : createShortProjectName(
                                                                                      project.name,
                                                                                  )}
                                                                        </ProjectLink>
                                                                    </DraggableItem>
                                                                )}
                                                            </Draggable>
                                                        )
                                                    },
                                                )}
                                            </DroppableList>
                                        )}
                                    </Droppable>
                                </div>
                            )
                        })}
                    </DragDropContext>
                    {props.sidebarVisible && (
                        <AddAreaContainer>
                            <Button
                                width="110px"
                                type="invert"
                                spacing="compact"
                                text={props.sidebarVisible ? 'Add Area' : ''}
                                iconSize="12px"
                                icon="add"
                                onClick={() => {
                                    const areaId = uuidv4()
                                    props.createArea(areaId, 'New Area', '')
                                }}
                            />
                        </AddAreaContainer>
                    )}
                </BodyContainer>
                <Footer visible={props.sidebarVisible}>
                    <StyledLink
                        sidebarVisible={props.sidebarVisible}
                        to="/settings"
                        activeStyle={{
                            backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                            borderRadius: '5px',
                        }}
                    >
                        {generateSidebarContents(props.sidebarVisible, 'settings', 'Settings')}
                    </StyledLink>
                    <CollapseContainer>
                        <Button
                            spacing="compact"
                            icon={props.sidebarVisible ? 'slideLeft' : 'slideRight'}
                            type="invert"
                            onClick={() => {
                                props.toggleSidebar()
                            }}
                            iconSize="18px"
                        />
                    </CollapseContainer>
                </Footer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    areas: state.areas,
    sidebarVisible: state.ui.sidebarVisible,
    theme: state.ui.theme,
    views: state.ui.views,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createProject: (id: Uuid, name: string, description: string, areaId: string) => {
        dispatch(createProject(id, name, description, areaId))
        dispatch(addView(id, name, 'project'))
        const component1Id = uuidv4()
        const component2Id = uuidv4()
        dispatch(
            addComponent(component1Id, id, 'main', {
                name: 'FilteredItemList',
                props: {
                    id: component1Id,
                    listName: 'Notes',
                    filter: `projectId == "${id}" and type == "NOTE" and not deleted`,
                    isFilterable: false,
                    hideIcons: [ItemIcons.Project],
                },
            }),
        )
        dispatch(
            addComponent(component2Id, id, 'main', {
                name: 'FilteredItemList',
                props: {
                    id: component2Id,
                    listName: 'Todos',
                    filter: `projectId == "${id}" and type == "TODO" and not (completed or deleted)`,
                    isFilterable: false,
                    hideIcons: [ItemIcons.Project],
                },
            }),
        )
    },
    toggleSidebar: () => {
        dispatch(toggleSidebar())
    },
    reorderProject: (id: Uuid, destinationId: Uuid) => {
        dispatch(reorderProject(id, destinationId))
    },
    setProjectArea: (id: Uuid, areaId: string) => {
        dispatch(setProjectArea(id, areaId))
    },
    createArea: (id: Uuid, name: string, description: string) => {
        dispatch(createArea(id, name, description))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
