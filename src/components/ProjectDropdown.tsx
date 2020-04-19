import React, { Component, ReactElement, useState } from 'react'
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
 function ProjectDropdown(props: ProjectDropdownProps): ReactElement {
   const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        } else if (actionMeta.action == 'create-option') {
            const newProjectId = uuidv4()
            props.createProject(newProjectId, newValue.value)
            props.onSubmit(newProjectId)
        }
        return
    }

    
        // Only render if it's not just the Inbox project that exists
        return (
            <ThemeProvider theme={theme}>
                <Container visible={props.projects.length > 1}>
                    <CreatableSelect
                        autoFocus={true}
                        placeholder={props.placeholder}
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
