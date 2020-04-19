import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'

import { Header2 } from './Typography'
import { theme } from '../theme'
import {
    createProject,
    toggleCreateProjectDialog,
    hideCreateProjectDialog,
} from '../actions'
import { Button } from './Button'
import InlineDialog from './InlineDialog'

const StyledInput = styled.input`
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    padding: 2px 5px;
    margin: 2px 2px;
    height: 25px;
    width: 150px;
`

const BodyContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 5px 0px;
    padding: 0px 0px 10px 0px;
`

export interface CreateProjectDialogProps {
    visible: boolean
    createProject: (id: Uuid, name: string, description: string) => void
    closeCreateProjectDialog: () => void
    toggleCreateProjectDialog: () => void
}

function CreateProjectDialog(props: CreateProjectDialogProps): ReactElement {
    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const createProjectInput = React.createRef<HTMLInputElement>()

    const handleChange = (e): void => {
        e.target.id == 'createProjectName'
            ? setProjectName(e.target.value)
            : setProjectDescription(e.target.value)
        return
    }

    const handleSubmit = (): void => {
        // Don't allow submitting blank project names
        if (projectName == '') return
        setProjectName('')
        setProjectDescription('')
        const projectId = uuidv4()
        props.createProject(projectId, projectName, projectDescription)
        return
    }

    return (
        <ThemeProvider theme={theme}>
            <InlineDialog
                onClose={() => props.closeCreateProjectDialog()}
                placement={'bottom-start'}
                isOpen={props.visible}
                onOpen={() => createProjectInput.current.focus()}
                content={
                    <div>
                        <Header2>Create Project</Header2>
                        <BodyContainer>
                            <StyledInput
                                autoFocus
                                id="createProjectName"
                                type="text"
                                value={projectName}
                                onChange={handleChange}
                                required
                                placeholder="Project name"
                                tabIndex={0}
                                ref={createProjectInput}
                            />
                            <StyledInput
                                id="createProjectDescription"
                                type="text"
                                value={projectDescription}
                                onChange={handleChange}
                                placeholder="Project description"
                                tabIndex={0}
                            />
                        </BodyContainer>
                        <Button
                            spacing="default"
                            type="primary"
                            onClick={handleSubmit}
                            text="Create"
                        ></Button>
                    </div>
                }
            >
                <Button
                    spacing="default"
                    type="primary"
                    onClick={() => props.toggleCreateProjectDialog()}
                    text="Add Project"
                ></Button>
            </InlineDialog>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    visible: state.ui.createProjectDialogVisible,
})

const mapDispatchToProps = (dispatch) => ({
    createProject: (id: Uuid, name: string, description: string) => {
        dispatch(createProject(id, name, description))
        dispatch(hideCreateProjectDialog())
    },
    closeCreateProjectDialog: () => {
        dispatch(hideCreateProjectDialog())
    },
    toggleCreateProjectDialog: () => {
        dispatch(toggleCreateProjectDialog())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateProjectDialog)
