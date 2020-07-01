import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'

import { Header3 } from './Typography'
import { themes } from '../theme'
import {
    createProject,
    toggleCreateProjectDialog,
    hideCreateProjectDialog,
    addView,
    addComponent,
} from '../actions'
import Button from './Button'
import InlineDialog from './InlineDialog'
import {
    Container,
    HeaderContainer,
    BodyContainer,
    StyledInput,
} from './styled/CreateProjectDialog'
import { ItemIcons } from '../interfaces/item'

interface StateProps {
    theme: string
    visible: boolean
}

interface DispatchProps {
    createProject: (id: Uuid, name: string, description: string) => void
    closeCreateProjectDialog: () => void
    toggleCreateProjectDialog: () => void
}

interface OwnProps {}
type CreateProjectDialogProps = OwnProps & DispatchProps & StateProps

function CreateProjectDialog(props: CreateProjectDialogProps): ReactElement {
    const [projectName, setProjectName] = useState('')
    const [projectDescription, setProjectDescription] = useState('')
    const createProjectInput = React.useRef<HTMLInputElement>()

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
        <ThemeProvider theme={themes[props.theme]}>
            <InlineDialog
                onClose={() => props.closeCreateProjectDialog()}
                placement="bottom-start"
                isOpen={props.visible}
                onOpen={() => createProjectInput.current.focus()}
                hideCloseButton={true}
                content={
                    <Container>
                        <HeaderContainer>
                            <Header3>Create Project</Header3>
                            <Button
                                spacing="default"
                                type="subtle"
                                onClick={() => {
                                    props.closeCreateProjectDialog()
                                }}
                                icon="close"
                            />
                        </HeaderContainer>
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
                            tabIndex={0}
                        ></Button>
                    </Container>
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

const mapStateToProps = (state): StateProps => ({
    visible: state.ui.createProjectDialogVisible,
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    createProject: (id: Uuid, name: string, description: string) => {
        dispatch(createProject(id, name, description))
        dispatch(addView(id, name, 'project'))
        dispatch(hideCreateProjectDialog())
        const component1Id = uuidv4()
        const component2Id = uuidv4()
        dispatch(
            addComponent(component1Id, id, 'main', {
                name: 'FilteredItemList',
                props: {
                    id: component1Id,
                    listName: 'Notes',
                    filter: `projectId == "${id}" and type == "NOTE" and not (completed or deleted)`,
                    isFilterable: false,
                    hideIcons: [ItemIcons.Project],
                },
            }),
        )
        dispatch(
            addComponent(component2Id, id, 'main', {
                name: 'FilteredItemList',
                props: {
                    id: component2Id,
                    listName: 'Todos',
                    filter: `projectId == "${id}" and type == "TODO" and not (completed or deleted)`,
                    isFilterable: false,
                    hideIcons: [ItemIcons.Project],
                },
            }),
        )
    },
    closeCreateProjectDialog: () => {
        dispatch(hideCreateProjectDialog())
    },
    toggleCreateProjectDialog: () => {
        dispatch(toggleCreateProjectDialog())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(CreateProjectDialog)
