import React, { ReactElement, Dispatch } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { lighten } from 'polished'
import { theme } from '../theme'
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
} from './styled/Sidebar'
import { Button } from './Button'
import { createShortProjectName } from '../utils'
import Settings from './Settings'
import { Uuid } from '@typed/uuid'

interface StateProps {
    projects: Projects
    sidebarVisible: boolean
}
interface DispatchProps {
    showCreateProjectDialog: () => void
    toggleSidebar: () => void
}
interface OwnProps {}

type SidebarProps = StateProps & DispatchProps & OwnProps
const Sidebar = (props: SidebarProps): ReactElement => {
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
                            backgroundColor: lighten(
                                0.05,
                                theme.colours.altBackgroundColour,
                            ),
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
                            onClick={() => {}}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/dailyAgenda"
                        activeStyle={{
                            backgroundColor: lighten(
                                0.05,
                                theme.colours.altBackgroundColour,
                            ),
                        }}
                    >
                        <Button
                            icon="calendar"
                            text={props.sidebarVisible ? 'Daily Agenda' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            onClick={() => {}}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/unscheduled"
                        activeStyle={{
                            backgroundColor: lighten(
                                0.05,
                                theme.colours.altBackgroundColour,
                            ),
                        }}
                    >
                        <Button
                            icon="scheduled"
                            text={props.sidebarVisible ? 'Unscheduled' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            onClick={() => {}}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/trash"
                        activeStyle={{
                            backgroundColor: lighten(
                                0.05,
                                theme.colours.altBackgroundColour,
                            ),
                        }}
                    >
                        <Button
                            icon="trash"
                            text={props.sidebarVisible ? 'Trash' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            onClick={() => {}}
                        />
                    </StyledNavLink>
                    <StyledNavLink
                        to="/completed"
                        activeStyle={{
                            backgroundColor: lighten(
                                0.05,
                                theme.colours.altBackgroundColour,
                            ),
                        }}
                    >
                        <Button
                            icon="todoChecked"
                            text={props.sidebarVisible ? 'Completed' : ''}
                            spacing="compact"
                            type="subtle"
                            textSize="small"
                            iconSize={props.sidebarVisible ? '16px' : '20px'}
                            onClick={() => {}}
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
                                    backgroundColor: lighten(
                                        0.05,
                                        theme.colours.altBackgroundColour,
                                    ),
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
                                    onClick={() => {}}
                                    textSize="small"
                                    iconSize="16px"
                                />
                            </StyledNavLink>
                        )
                    })}
                </BodyContainer>
                <Footer visible={props.sidebarVisible}>
                    <div
                        style={{
                            gridArea: 'settings',
                            width: '100%',
                        }}
                    >
                        <Settings />
                    </div>
                    <div style={{ gridArea: 'collapse' }}>
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
                    </div>
                </Footer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    sidebarVisible: state.ui.sidebarVisible,
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
