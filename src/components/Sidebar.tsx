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
    reorderArea,
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
    DraggableItem,
    SubsectionHeader,
} from './styled/Sidebar'
import Button from './Button'
import { createShortName } from '../utils'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'

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
    align-items: center;
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
    padding: ${(props) => (props.sidebarVisible ? '4px 2px 4px 20px' : '4px 2px 4px 2px')};
    font-size: ${(props) =>
        props.sidebarVisible ? props.theme.fontSizes.xsmall : props.theme.fontSizes.xxsmall};
`
interface AreaLinkProps {
    sidebarVisible: boolean
}
export const AreaLink = styled(StyledLink)<AreaLinkProps>`
    width: 100%;
    padding: '5px 5px 5px 5px';
    font-size: ${(props) => props.theme.fontSizes.small};
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
    createProject: (id: string, name: string, description: string, areaId: string) => void
    reorderProject: (id: string, destinationId: string) => void
    setProjectArea: (id: string, areaId: string) => void
    createArea: (id: string, name: string, description: string) => void
    reorderArea: (id: string, destinationId: string) => void
}

const SidebarItem = (props: {
    sidebarVisible: boolean
    iconName: string
    text: string
}): React.ReactElement => {
    if (props.sidebarVisible) {
        return (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                {Icons[props.iconName](16, 16)}
                {props.text}
            </div>
        )
    }
    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            {Icons[props.iconName](20, 20)}
        </div>
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
                            <SidebarItem
                                sidebarVisible={props.sidebarVisible}
                                iconName={'inbox'}
                                text={'Inbox'}
                            />
                        </StyledLink>
                        <StyledLink
                            sidebarVisible={props.sidebarVisible}
                            to="/dailyAgenda"
                            activeStyle={{
                                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                            }}
                        >
                            <SidebarItem
                                sidebarVisible={props.sidebarVisible}
                                iconName={'calendar'}
                                text={'Daily Agenda'}
                            />
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
                                    <SidebarItem
                                        sidebarVisible={props.sidebarVisible}
                                        iconName={view.icon}
                                        text={view.name}
                                    />
                                </StyledLink>
                            )
                        })}
                    </ViewContainer>
                    <SectionHeader visible={props.sidebarVisible}>
                        {Icons['area'](22, 22, themes[props.theme].colours.primaryColour)}
                        {props.sidebarVisible && <HeaderName>Areas</HeaderName>}
                    </SectionHeader>

                    <DragDropContext
                        onDragEnd={(e) => {
                            if (e.type == 'PROJECT') {
                                // TODO: Trying to detect drops in non-valid areas
                                if (!e.destination) {
                                    return
                                }
                                props.setProjectArea(e.draggableId, e.destination.droppableId)
                                props.reorderProject(
                                    e.draggableId,
                                    props.projects.order[e.destination.index],
                                )
                            }
                            if (e.type == 'AREA') {
                                props.reorderArea(
                                    e.draggableId,
                                    props.areas.order[e.destination.index],
                                )
                            }
                        }}
                    >
                        <Droppable droppableId={uuidv4()} type="AREA">
                            {(provided, snapshot) => (
                                <DroppableList
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    isDraggingOver={snapshot.isDraggingOver}
                                    sidebarVisible={props.sidebarVisible}
                                >
                                    {Object.values(props.areas.order).map((a: string, index) => {
                                        const area = props.areas.areas[a]
                                        return (
                                            <Draggable key={a} draggableId={a} index={index}>
                                                {(provided, snapshot) => (
                                                    <DraggableItem
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        key={'container-' + a}
                                                        isDragging={snapshot.isDragging}
                                                        draggableStyle={
                                                            provided.draggableProps.style
                                                        }
                                                        siebarVisible={props.sidebarVisible}
                                                    >
                                                        {!props.sidebarVisible && (
                                                            <StyledHorizontalRule />
                                                        )}
                                                        <SubsectionHeader
                                                            visible={props.sidebarVisible}
                                                        >
                                                            <AreaLink
                                                                sidebarVisible={
                                                                    props.sidebarVisible
                                                                }
                                                                to={`/areas/${area.id}`}
                                                                activeStyle={{
                                                                    backgroundColor:
                                                                        theme.colours
                                                                            .focusAltDialogBackgroundColour,
                                                                }}
                                                            >
                                                                {props.sidebarVisible
                                                                    ? area.name
                                                                    : createShortName(area.name)}
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
                                                                    history.push(
                                                                        '/projects/' + projectId,
                                                                    )
                                                                }}
                                                            />
                                                        </SubsectionHeader>
                                                        <Droppable droppableId={a} type="PROJECT">
                                                            {(provided, snapshot) => (
                                                                <DroppableList
                                                                    {...provided.droppableProps}
                                                                    ref={provided.innerRef}
                                                                    isDraggingOver={
                                                                        snapshot.isDraggingOver
                                                                    }
                                                                    sidebarVisible={
                                                                        props.sidebarVisible
                                                                    }
                                                                >
                                                                    {Object.values(
                                                                        props.projects.order,
                                                                    ).map((p: string, index) => {
                                                                        // Don't render the inbox here
                                                                        if (p == '0') return
                                                                        const project =
                                                                            props.projects.projects[
                                                                                p
                                                                            ]
                                                                        // Only render those in that area
                                                                        if (project.areaId != a)
                                                                            return
                                                                        const pathName =
                                                                            '/projects/' + p
                                                                        //
                                                                        return (
                                                                            <Draggable
                                                                                key={p}
                                                                                draggableId={p}
                                                                                index={index}
                                                                            >
                                                                                {(
                                                                                    provided,
                                                                                    snapshot,
                                                                                ) => (
                                                                                    <DraggableItem
                                                                                        ref={
                                                                                            provided.innerRef
                                                                                        }
                                                                                        {...provided.draggableProps}
                                                                                        {...provided.dragHandleProps}
                                                                                        key={
                                                                                            'container-' +
                                                                                            p
                                                                                        }
                                                                                        isDragging={
                                                                                            snapshot.isDragging
                                                                                        }
                                                                                        draggableStyle={
                                                                                            provided
                                                                                                .draggableProps
                                                                                                .style
                                                                                        }
                                                                                        siebarVisible={
                                                                                            props.sidebarVisible
                                                                                        }
                                                                                    >
                                                                                        <ProjectLink
                                                                                            sidebarVisible={
                                                                                                props.sidebarVisible
                                                                                            }
                                                                                            key={p}
                                                                                            to={
                                                                                                pathName
                                                                                            }
                                                                                            activeStyle={{
                                                                                                backgroundColor:
                                                                                                    theme
                                                                                                        .colours
                                                                                                        .focusAltDialogBackgroundColour,
                                                                                            }}
                                                                                        >
                                                                                            {props.sidebarVisible
                                                                                                ? project.name
                                                                                                : createShortName(
                                                                                                      project.name,
                                                                                                  )}
                                                                                        </ProjectLink>
                                                                                    </DraggableItem>
                                                                                )}
                                                                            </Draggable>
                                                                        )
                                                                    })}
                                                                </DroppableList>
                                                            )}
                                                        </Droppable>
                                                    </DraggableItem>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                </DroppableList>
                            )}
                        </Droppable>
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
                                    history.push(`/areas/${areaId}`)
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
                        <SidebarItem
                            sidebarVisible={props.sidebarVisible}
                            iconName={'settings'}
                            text={'Settings'}
                        />
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
    createProject: (id: string, name: string, description: string, areaId: string) => {
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
    reorderProject: (id: string, destinationId: string) => {
        dispatch(reorderProject(id, destinationId))
    },
    setProjectArea: (id: string, areaId: string) => {
        dispatch(setProjectArea(id, areaId))
    },
    createArea: (id: string, name: string, description: string) => {
        dispatch(createArea(id, name, description))
    },
    reorderArea: (id: string, destinationId: string) => {
        dispatch(reorderArea(id, destinationId))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
