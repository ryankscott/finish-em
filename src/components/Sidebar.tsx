import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { theme } from '../theme'
import CreateProjectDialog from './CreateProjectDialog'
import { Header } from './Typography'
import { showCreateProjectDialog } from '../actions'
import { ProjectType } from '../interfaces'
import { Container, SectionHeader, StyledNavLink } from './styled/Sidebar'

interface SidebarProps {
  sidebarVisible: boolean
  projects: ProjectType[]
}
const Sidebar = (props: SidebarProps): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Container visible={props.sidebarVisible}>
        <SectionHeader>
          <Header> Views </Header>
        </SectionHeader>
        <StyledNavLink
          to="/inbox"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {'📥  Inbox'}
        </StyledNavLink>
        <StyledNavLink
          to="/dailyAgenda"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {'📅 Daily Agenda '}
        </StyledNavLink>
        <StyledNavLink
          to="/unscheduled"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {'🗓 Unscheduled'}
        </StyledNavLink>
        <StyledNavLink
          to="/trash"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {'🗑 Trash'}
        </StyledNavLink>
        <StyledNavLink
          to="/completed"
          activeStyle={{ fontWeight: theme.fontWeights.bold }}
        >
          {'✅ Completed'}
        </StyledNavLink>
        <SectionHeader>
          <Header>Projects</Header>
          <CreateProjectDialog />
        </SectionHeader>
        {props.projects.map((p: ProjectType) => {
          const pathName = '/projects/' + p.id
          if (!(p.id == null || p.deleted == true)) {
            return (
              <StyledNavLink
                key={p.id}
                to={pathName}
                activeStyle={{ fontWeight: theme.fontWeights.bold }}
              >
                {p.name}
              </StyledNavLink>
            )
          }
        })}
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
})
export default connect(mapStateToProps, mapDispatchToProps)(Sidebar)
