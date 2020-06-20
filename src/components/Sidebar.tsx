import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { themes } from '../theme'
import CreateProjectDialog from './CreateProjectDialog'
import { Header } from './Typography'
import { showCreateProjectDialog, toggleSidebar, reorderProject } from '../actions'
import { Projects, Views } from '../interfaces'
import {
    Container,
    SectionHeader,
    StyledNavLink,
    Footer,
    StyledHorizontalRule,
    BodyContainer,
    CollapseContainer,
} from './styled/Sidebar'
import Button from './Button'
import { createShortProjectName } from '../utils'
import { Uuid } from '@typed/uuid'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import uuidv4 from 'uuid/v4'
import * as CSS from 'csstype'

interface StateProps {
    projects: Projects
    sidebarVisible: boolean
    theme: string
    views: Views
}
interface DispatchProps {
    showCreateProjectDialog: () => void
    toggleSidebar: () => void
    reorderProject: (id: Uuid, destinationId: Uuid) => void
}

type SidebarProps = StateProps & DispatchProps
const Sidebar = (props: SidebarProps): ReactElement => {
    const theme = themes[props.theme]
    const getListStyle = (isDraggingOver: boolean): CSS.Properties => ({
        background: isDraggingOver ? 'inherit' : 'inherit',
        padding: '5px',
        width: '100%',
    })

    const getProjectStyle = (isDragging: boolean, draggableStyle): CSS.Properties => ({
        ...draggableStyle,
        display: 'flex',
        flexDirection: 'row',
        height: 'auto',
        userSelect: 'none',
        margin: '0px',
        padding: '0px',
        // change background colour if dragging
        background: isDragging
            ? theme.colours.focusAltDialogBackgroundColour
            : theme.colours.altBackgroundColour,
    })
    return (
        <ThemeProvider theme={theme}>
            <Container visible={props.sidebarVisible}>
                <BodyContainer>
                    <SectionHeader>
                        {props.sidebarVisible && <Header> Views </Header>}
                    </SectionHeader>
                    <StyledNavLink
                        to="/inbox"
                        activeStyle={{
                            backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="inbox"
                            text={props.sidebarVisible ? 'Inbox' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/dailyAgenda"
                        activeStyle={{
                            backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="calendar"
                            text={props.sidebarVisible ? 'Daily Agenda' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/labels"
                        activeStyle={{
                            backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="label"
                            text={props.sidebarVisible ? 'Labels' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    {Object.values(props.views.order).map((v) => {
                        const view = props.views.views[v]
                        return (
                            <StyledNavLink
                                key={view.id}
                                to={`/${view.name}`}
                                activeStyle={{
                                    backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                                }}
                            >
                                <Button
                                    icon={view.icon}
                                    text={props.sidebarVisible ? view.name : ''}
                                    spacing="compact"
                                    type="subtle"
                                    textSize="small"
                                    iconSize={props.sidebarVisible ? '16px' : '20px'}
                                />
                            </StyledNavLink>
                        )
                    })}
                    {!props.sidebarVisible && <StyledHorizontalRule />}
                    <SectionHeader>
                        {props.sidebarVisible && <Header>Projects</Header>}
                        {props.sidebarVisible && <CreateProjectDialog />}
                    </SectionHeader>
                    <DragDropContext
                        onDragEnd={(e) => {
                            props.reorderProject(
                                e.draggableId,
                                props.projects.order[e.destination.index],
                            )
                        }}
                    >
                        <Droppable droppableId={uuidv4()} type="PROJECT">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {props.projects.order?.map((p: Uuid, index) => {
                                        // Don't render the inbox here
                                        if (p == '0') return
                                        const pathName = '/projects/' + p
                                        const project = props.projects.projects[p]
                                        return (
                                            <Draggable key={p} draggableId={p} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        key={'container-' + p}
                                                        style={getProjectStyle(
                                                            snapshot.isDragging,
                                                            provided.draggableProps.style,
                                                        )}
                                                    >
                                                        <StyledNavLink
                                                            key={p}
                                                            to={pathName}
                                                            activeStyle={{
                                                                backgroundColor:
                                                                    theme.colours
                                                                        .focusAltDialogBackgroundColour,
                                                            }}
                                                        >
                                                            <Button
                                                                text={
                                                                    props.sidebarVisible
                                                                        ? project.name
                                                                        : createShortProjectName(
                                                                              project.name,
                                                                          )
                                                                }
                                                                spacing="compact"
                                                                type="subtle"
                                                                textSize="small"
                                                                iconSize="16px"
                                                            />
                                                        </StyledNavLink>
                                                    </div>
                                                )}
                                            </Draggable>
                                        )
                                    })}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </BodyContainer>
                <Footer visible={props.sidebarVisible}>
                    <StyledNavLink
                        to="/settings"
                        activeStyle={{
                            backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                            borderRadius: '5px',
                        }}
                    >
                        <Button
                            icon="settings"
                            text={props.sidebarVisible ? 'Settings' : ''}
                            spacing={props.sidebarVisible ? 'compact' : 'default'}
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            translateY={props.sidebarVisible == true ? 1 : 0}
                        />
                    </StyledNavLink>
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
    sidebarVisible: state.ui.sidebarVisible,
    theme: state.ui.theme,
    views: state.ui.views,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    showCreateProjectDialog: () => {
        dispatch(showCreateProjectDialog())
    },
    toggleSidebar: () => {
        dispatch(toggleSidebar())
    },
    reorderProject: (id: Uuid, destinationId: Uuid) => {
        dispatch(reorderProject(id, destinationId))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
