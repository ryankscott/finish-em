import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { themes } from '../theme'
import CreateProjectDialog from './CreateProjectDialog'
import { Header } from './Typography'
import { showCreateProjectDialog, toggleSidebar } from '../actions'
import { Projects } from '../interfaces'
import {
    Container,
    SectionHeader,
    StyledNavLink,
    Footer,
    StyledHorizontalRule,
    BodyContainer,
    SettingsContainer,
    CollapseContainer,
} from './styled/Sidebar'
import Button from './Button'
import { createShortProjectName } from '../utils'
import Settings from './Settings'
import { Uuid } from '@typed/uuid'

interface StateProps {
    projects: Projects
    sidebarVisible: boolean
    theme: string
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
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="inbox"
                            text={props.sidebarVisible ? 'Inbox' : ''}
                            spacing={
                                props.sidebarVisible ? 'compact' : 'default'
                            }
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            translate={props.sidebarVisible == true ? 1 : 0}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/dailyAgenda"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
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
                        to="/unscheduled"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="scheduled"
                            text={props.sidebarVisible ? 'Unscheduled' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/trash"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="trash"
                            text={props.sidebarVisible ? 'Trash' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/completed"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="todoChecked"
                            text={props.sidebarVisible ? 'Completed' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/stale"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
                        }}
                    >
                        <Button
                            icon="stale"
                            text={props.sidebarVisible ? 'Stale' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/labels"
                        activeStyle={{
                            backgroundColor:
                                theme.colours.focusAltDialogBackgroundColour,
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
                        )
                    })}
                </BodyContainer>
                <Footer visible={props.sidebarVisible}>
                    <SettingsContainer collapsed={!props.sidebarVisible}>
                        <Settings />
                    </SettingsContainer>
                    <CollapseContainer>
                        <Button
                            spacing="compact"
                            icon={
                                props.sidebarVisible
                                    ? 'slideLeft'
                                    : 'slideRight'
                            }
                            type="invert"
                            onClick={() => {
                                props.toggleSidebar()
                            }}
                            iconSize="16px"
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
