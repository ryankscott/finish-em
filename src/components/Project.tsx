import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { theme } from '../theme'
import {
    updateProjectDescription,
    updateProjectName,
    deleteProject,
    hideDeleteProjectDialog,
    toggleDeleteProjectDialog,
} from '../actions'
import { Title } from './Typography'
import EditableText from './EditableText'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import DeleteProjectDialog from './DeleteProjectDialog'
import { Uuid } from '@typed/uuid'
import { ProjectType } from '../interfaces'
import {
    ProjectContainer,
    HeaderContainer,
    AddProjectContainer,
} from './styled/Project'
import ItemCreator from './ItemCreator'
import { ItemIcons } from './Item'

export interface ProjectProps {
    deleteProject: (id: Uuid) => void
    updateDescription: (id: Uuid, input: string) => void
    project: ProjectType
    updateName: (id: Uuid, input: string) => void
}
const Project = (props: ProjectProps): ReactElement => {
    const history = useHistory()
    const name = React.createRef<HTMLInputElement>()
    const description = React.createRef<HTMLInputElement>()

    function deleteProject(): void {
        props.deleteProject(props.project.id)
        history.push('/inbox')
        return
    }

    return (
        <ThemeProvider theme={theme}>
            <ProjectContainer>
                <HeaderContainer>
                    <EditableText
                        key={props.project.id + 'name'}
                        input={props.project.name}
                        style={Title}
                        singleline={true}
                        innerRef={name}
                        onUpdate={(input) => {
                            props.updateName(props.project.id, input)
                        }}
                    />
                    <DeleteProjectDialog onDelete={() => deleteProject()} />
                </HeaderContainer>
                <EditableText
                    key={props.project.id + 'description'}
                    onUpdate={(input) => {
                        props.updateDescription(props.project.id, input)
                    }}
                    innerRef={description}
                    input={props.project.description}
                    height="150px"
                />
                <AddProjectContainer>
                    <ItemCreator
                        type="item"
                        projectId={props.project.id}
                        buttonText="Add to project"
                        width="100%"
                        initiallyExpanded={false}
                    />
                </AddProjectContainer>
                <FilteredItemList
                    filter={FilterEnum.ShowFromProjectByType}
                    filterParams={{ projectId: props.project.id, type: 'NOTE' }}
                    listName="Notes"
                    isFilterable={false}
                    hideIcons={[ItemIcons.Project]}
                />
                <FilteredItemList
                    filter={FilterEnum.ShowFromProjectByType}
                    filterParams={{ projectId: props.project.id, type: 'TODO' }}
                    listName="Todos"
                    isFilterable={true}
                    hideIcons={[ItemIcons.Project]}
                />
            </ProjectContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    items: state.items,
})
const mapDispatchToProps = (dispatch) => ({
    updateDescription: (id: Uuid, text: string) => {
        dispatch(updateProjectDescription(id, text))
    },
    updateName: (id: Uuid, text: string) => {
        dispatch(updateProjectName(id, text))
    },
    deleteProject: (id: Uuid) => {
        dispatch(deleteProject(id))
        dispatch(hideDeleteProjectDialog())
    },
    toggleDeleteProjectDialog: () => {
        dispatch(toggleDeleteProjectDialog())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Project)
