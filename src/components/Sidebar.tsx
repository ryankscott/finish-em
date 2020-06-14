import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { themes } from '../theme'
import CreateProjectDialog from './CreateProjectDialog'
import { Header } from './Typography'
import { showCreateProjectDialog, toggleSidebar } from '../actions'
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

interface StateProps {
    projects: Projects
    sidebarVisible: boolean
    theme: string
    views: Views
}
interface DispatchProps {
    showCreateProjectDialog: () => void
    toggleSidebar: () => void
}

type SidebarProps = StateProps & DispatchProps
const Sidebar = (props: SidebarProps): ReactElement => {
    const theme = themes[props.theme]
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
                    {props.projects.order?.map((p: Uuid) => {
                        // Don't render the inbox here
                        if (p == '0') return
                        const pathName = '/projects/' + p
                        const project = props.projects.projects[p]
                        return (
                            <StyledNavLink
                                key={p}
                                to={pathName}
                                activeStyle={{
                                    backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                                }}
                            >
                                <Button
                                    text={
                                        props.sidebarVisible
                                            ? project.name
                                            : createShortProjectName(project.name)
                                    }
                                    spacing="compact"
                                    type="subtle"
                                    textSize="small"
                                    iconSize="16px"
                                />
                            </StyledNavLink>
                        )
                    })}
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
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
