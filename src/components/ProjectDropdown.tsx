import React, { Component, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import uuidv4 from 'uuid/v4'
import { theme, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'

import { connect } from 'react-redux'
import { createProject } from '../actions'
import { ProjectType } from '../interfaces'
import { Container } from './styled/ProjectDropdown'

const generateOptions = (
  options: ProjectType[],
): { value: Uuid; label: string }[] => {
  return options
    .filter((m) => m.id != null)
    .filter((m) => m.deleted == false)
    .map((m) => ({ value: m.id, label: m.name }))
}
interface ProjectDropdownProps {
  onSubmit: (value: string) => void
  onEscape?: () => void
  createProject: (id: Uuid, value: string) => void
  placeholder: string
  projects: ProjectType[]
}
interface ProjectDropdownState {
  selectedOption: {}
}
class ProjectDropdown extends Component<
  ProjectDropdownProps,
  ProjectDropdownState
> {
  private selectRef: React.RefObject<any>
  constructor(props) {
    super(props)
    this.state = { selectedOption: null }
    this.handleChange = this.handleChange.bind(this)
  }

  componentDidUpdate(prevProps): void {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.current.focus()
    }
    return
  }

  handleChange(newValue, actionMeta): void {
    if (actionMeta.action == 'select-option') {
      this.props.onSubmit(newValue.value)
    } else if (actionMeta.action == 'create-option') {
      const newProjectId = uuidv4()
      this.props.createProject(newProjectId, newValue.value)
      this.props.onSubmit(newProjectId)
    }
    return
  }

  render(): ReactElement {
    const { projects } = this.props
    // Only render if it's not just the Inbox project that exists
    return (
      <ThemeProvider theme={theme}>
        <Container visible={projects.length > 1}>
          <CreatableSelect
            autoFocus={true}
            placeholder={this.props.placeholder}
            isSearchable
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={generateOptions(this.props.projects)}
            styles={selectStyles}
            escapeClearsValue={true}
            defaultMenuIsOpen={true}
            onKeyDown={(e) => {
              if (e.key == 'Escape') {
                this.props.onEscape()
              }
            }}
          />
        </Container>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  projects: state.projects,
})
const mapDispatchToProps = (dispatch) => ({
  createProject: (id: Uuid, name: string) => {
    dispatch(createProject(id, name, ''))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropdown)
