import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import uuidv4 from 'uuid/v4'
import { theme, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'

import { connect } from 'react-redux'
import { createProject } from '../actions'
import { ProjectType } from '../interfaces'
import { Container, Project } from './styled/ProjectDropdown'
import { getProjectNameById } from '../utils'
import { Button } from './Button'

const generateOptions = (
    options: ProjectType[],
): { value: Uuid; label: string }[] => {
    return options
        .filter((m) => m.id != null)
        .filter((m) => m.deleted == false)
        .map((m) => ({ value: m.id, label: m.name }))
}
interface ProjectDropdownProps {
    projectId: Uuid
    disableClick?: boolean
    completed: boolean
    onSubmit: (value: string) => void
    onEscape?: () => void
    createProject: (id: Uuid, value: string) => void
    projects: ProjectType[]
}
function ProjectDropdown(props: ProjectDropdownProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        } else if (actionMeta.action == 'create-option') {
            const newProjectId = uuidv4()
            props.createProject(newProjectId, newValue.value)
            props.onSubmit(newProjectId)
        }
        setShowSelect(false)
        return
    }

    // Only render if it's not just the Inbox project that exists
    return (
        <ThemeProvider theme={theme}>
            <div>
                <Button
                    spacing="compact"
                    type="primary"
                    onClick={(e) => {
                        if (props.disableClick) return
                        e.stopPropagation()
                        if (props.completed) return
                        setShowSelect(!showSelect)
                    }}
                    text={getProjectNameById(props.projectId, props.projects)}
                />
                {showSelect && (
                    <Container visible={props.projects.length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Project:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(props.projects)}
                            styles={selectStyles}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={true}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    props.onEscape()
                                }
                            }}
                        />
                    </Container>
                )}
            </div>
        </ThemeProvider>
    )
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
