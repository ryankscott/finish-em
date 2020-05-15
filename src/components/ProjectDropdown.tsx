import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import uuidv4 from 'uuid/v4'
import { theme, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'

import { connect } from 'react-redux'
import { createProject } from '../actions'
import { Projects, Project, ProjectType } from '../interfaces'
import {
    Container,
    DisabledContainer,
    ProjectName,
} from './styled/ProjectDropdown'
import { Button } from './Button'

const generateOptions = (
    projectId: Uuid | '0',
    options: Project,
): { value: Uuid | '0'; label: string }[] => {
    const p: ProjectType[] = Object.values(options)
    return p
        .filter((p) => p.id != '0')
        .filter((p) => p.id != projectId)
        .filter((p) => p.deleted == false)
        .map((p) => ({ value: p.id, label: p.name }))
}

interface DispatchProps {
    createProject: (id: Uuid, value: Uuid | '0') => void
}
interface StateProps {
    projects: Projects
}
interface OwnProps {
    onSubmit: (value: Uuid | '0') => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    projectId: Uuid | '0'
    disableClick?: boolean
    completed: boolean
    showSelect?: boolean
}

type ProjectDropdownProps = DispatchProps & StateProps & OwnProps
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
                {props.disableClick ? (
                    <DisabledContainer>
                        <ProjectName>
                            {props.projects.projects[props.projectId].name}
                        </ProjectName>
                    </DisabledContainer>
                ) : (
                    <Button
                        spacing="compact"
                        type={props.style || 'default'}
                        onClick={(e) => {
                            if (props.completed) return
                            setShowSelect(!showSelect)
                            e.stopPropagation()
                        }}
                        text={props.projects.projects[props.projectId].name}
                    />
                )}
                {(showSelect || props.showSelect) && (
                    <Container visible={props.projects.order.length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Project:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(
                                props.projectId,
                                props.projects.projects,
                            )}
                            styles={selectStyles}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={true}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    setShowSelect(false)
                                }
                            }}
                        />
                    </Container>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createProject: (id: Uuid, name: string) => {
        dispatch(createProject(id, name, ''))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropdown)
