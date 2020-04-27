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
import { Title, Header1 } from './Typography'
import EditableText from './EditableText'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import DeleteProjectDialog from './DeleteProjectDialog'
import QuickAdd from './QuickAdd'
import { Uuid } from '@typed/uuid'
import { ProjectType } from '../interfaces'
import { ProjectContainer, HeaderContainer } from './styled/Project'

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
                    width="670px"
                />
                <Header1> Add to project </Header1>
                <QuickAdd projectId={props.project.id} />
                <FilteredItemList
                    filter={FilterEnum.ShowFromProjectByType}
                    filterParams={{ projectId: props.project.id, type: 'NOTE' }}
                    listName="Notes"
                    isFilterable={false}
                    showProject={false}
                />
                <FilteredItemList
                    filter={FilterEnum.ShowFromProjectByType}
                    filterParams={{ projectId: props.project.id, type: 'TODO' }}
                    listName="Todos"
                    isFilterable={true}
                    showProject={false}
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
