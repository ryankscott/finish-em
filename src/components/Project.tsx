import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { themes } from '../theme'
import {
    updateProjectDescription,
    updateProjectName,
    deleteProject,
    hideDeleteProjectDialog,
    toggleDeleteProjectDialog,
    setProjectStartDate,
    setProjectEndDate,
} from '../actions'
import { Title } from './Typography'
import EditableText from './EditableText'
import FilteredItemList from '../containers/FilteredItemList'
import DeleteProjectDialog from './DeleteProjectDialog'
import { Uuid } from '@typed/uuid'
import { ProjectType } from '../interfaces'
import { ProjectContainer, HeaderContainer, AddProjectContainer } from './styled/Project'
import ItemCreator from './ItemCreator'
import { ItemIcons } from './Item'
import Button from './Button'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { formatRelativeDate } from '../utils'
import { parseISO } from 'date-fns'

interface StateProps {
    theme: string
    projectDates: boolean
}

interface DispatchProps {
    deleteProject: (id: Uuid | '0') => void
    updateDescription: (id: Uuid | '0', input: string) => void
    updateName: (id: Uuid | '0', input: string) => void
    toggleDeleteProjectDialog: () => void
    setProjectEndDate: (id: Uuid, date: string) => void
    setProjectStartDate: (id: Uuid, date: string) => void
}

interface OwnProps {
    project: ProjectType
}

type ProjectProps = DispatchProps & OwnProps & StateProps
const Project = (props: ProjectProps): ReactElement => {
    const history = useHistory()
    const name = React.useRef<HTMLInputElement>()
    const description = React.useRef<HTMLInputElement>()
    const [showEdit, setShowEdit] = useState(false)

    function deleteProject(): void {
        props.deleteProject(props.project.id)
        history.push('/inbox')
        return
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <ProjectContainer>
                <HeaderContainer>
                    <EditableText
                        shouldSubmitOnBlur={true}
                        validation={false}
                        key={props.project.id + 'name'}
                        input={props.project.name}
                        style={Title}
                        singleline={true}
                        innerRef={name}
                        onUpdate={(input) => {
                            props.updateName(props.project.id, input)
                        }}
                        shouldClearOnSubmit={false}
                    />
                    <DeleteProjectDialog onDelete={() => deleteProject()} />
                    <Button
                        type={'primary'}
                        spacing={'compact'}
                        width={'60px'}
                        text={'Edit'}
                        onClick={() => {
                            setShowEdit(!showEdit)
                        }}
                    />
                </HeaderContainer>
                {props?.projectDates && (
                    <div style={{ paddingLeft: '10px' }}>
                        {'Start: '}
                        <DayPickerInput
                            value={
                                props.project.startAt
                                    ? formatRelativeDate(parseISO(props.project.startAt))
                                    : ''
                            }
                            key={'start'}
                            onDayChange={(e) => {
                                props.setProjectStartDate(props.project.id, e.toISOString())
                            }}
                        />
                        {'End: '}
                        <DayPickerInput
                            key={'end'}
                            value={
                                props.project.endAt
                                    ? formatRelativeDate(parseISO(props.project.endAt))
                                    : ''
                            }
                            onDayChange={(e) => {
                                props.setProjectEndDate(props.project.id, e.toISOString())
                            }}
                        />
                    </div>
                )}
                <EditableText
                    shouldSubmitOnBlur={true}
                    validation={false}
                    key={props.project.id + 'description'}
                    onUpdate={(input) => {
                        props.updateDescription(props.project.id, input)
                    }}
                    innerRef={description}
                    input={props.project.description}
                    height="150px"
                    shouldClearOnSubmit={false}
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
                    listName="Notes"
                    filter={`projectId == "${props.project.id}" and type == "NOTE"`}
                    isFilterable={false}
                    hideIcons={[ItemIcons.Project]}
                    readOnly={!showEdit}
                />
                <FilteredItemList
                    listName="Todos"
                    filter={`projectId == "${props.project.id}" and type == "TODO"`}
                    isFilterable={true}
                    hideIcons={[ItemIcons.Project]}
                    readOnly={!showEdit}
                />
            </ProjectContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    projectDates: state.features.projectDates,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
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
    setProjectStartDate: (id: Uuid, date: string) => {
        dispatch(setProjectStartDate(id, date))
    },
    setProjectEndDate: (id: Uuid, date: string) => {
        dispatch(setProjectEndDate(id, date))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Project)
