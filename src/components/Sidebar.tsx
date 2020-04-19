import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { theme } from '../theme'
import CreateProjectDialog from './CreateProjectDialog'
import { Header } from './Typography'
import { showCreateProjectDialog, toggleSidebar } from '../actions'
import { ProjectType } from '../interfaces'
import {
    Container,
    SectionHeader,
    StyledNavLink,
    Footer,
    StyledHorizontalRule,
} from './styled/Sidebar'
import { Button } from './Button'
import { getFirstLetterFromEachWord } from '../utils'

interface SidebarProps {
    sidebarVisible: boolean
    projects: ProjectType[]
}
const Sidebar = (props: SidebarProps): ReactElement => {
    return (
        <ThemeProvider theme={theme}>
            <Container visible={props.sidebarVisible}>
                <SectionHeader>
                    {props.sidebarVisible && <Header> Views </Header>}
                </SectionHeader>
                <StyledNavLink to="/inbox">
                    <Button
                        icon="inbox"
                        text={props.sidebarVisible ? 'Inbox' : ''}
                        spacing={props.sidebarVisible ? 'compact' : 'default'}
                        type="invert"
                        textSize="small"
                        iconSize={props.sidebarVisible ? '16px' : '20px'}
                        onClick={() => {}}
                    />
                </StyledNavLink>
                <StyledNavLink to="/dailyAgenda">
                    <Button
                        icon="calendar"
                        text={props.sidebarVisible ? 'Daily Agenda' : ''}
                        spacing="compact"
                        type="invert"
                        textSize="small"
                        iconSize={props.sidebarVisible ? '16px' : '20px'}
                        onClick={() => {}}
                    />
                </StyledNavLink>
                <StyledNavLink to="/unscheduled">
                    <Button
                        icon="scheduled"
                        text={props.sidebarVisible ? 'Unscheduled' : ''}
                        spacing="compact"
                        type="invert"
                        textSize="small"
                        iconSize={props.sidebarVisible ? '16px' : '20px'}
                        onClick={() => {}}
                    />
                </StyledNavLink>
                <StyledNavLink to="/trash">
                    <Button
                        icon="trash"
                        text={props.sidebarVisible ? 'Trash' : ''}
                        spacing="compact"
                        type="invert"
                        textSize="small"
                        iconSize={props.sidebarVisible ? '16px' : '20px'}
                        onClick={() => {}}
                    />
                </StyledNavLink>
                <StyledNavLink to="/completed">
                    <Button
                        icon="todo_checked"
                        text={props.sidebarVisible ? 'Completed' : ''}
                        spacing="compact"
                        type="invert"
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
                {props.projects.map((p: ProjectType) => {
                    const pathName = '/projects/' + p.id
                    if (!(p.id == null || p.deleted == true)) {
                        return (
                            <StyledNavLink key={p.id} to={pathName}>
                                <Button
                                    text={
                                        props.sidebarVisible
                                            ? p.name
                                            : getFirstLetterFromEachWord(p.name)
                                    }
                                    spacing="compact"
                                    type="invert"
                                    onClick={() => {}}
                                    textSize="small"
                                    iconSize="16px"
                                />
                            </StyledNavLink>
                        )
                    }
                })}
                <Footer visible={props.sidebarVisible}>
                    <Button
                        spacing="compact"
                        icon={
                            props.sidebarVisible ? 'slide_left' : 'slide_right'
                        }
                        type="invert"
                        onClick={() => {
                            props.toggleSidebar()
                        }}
                        textSize="small"
                        iconSize="16px"
                    />
                </Footer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    projects: state.projects,
    sidebarVisible: state.ui.sidebarVisible,
})
const mapDispatchToProps = (dispatch) => ({
    showCreateProjectDialog: () => {
        dispatch(showCreateProjectDialog())
    },
    toggleSidebar: () => {
        dispatch(toggleSidebar())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
