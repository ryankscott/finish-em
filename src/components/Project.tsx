import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
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
    deleteView,
} from '../actions'
import { Title } from './Typography'
import EditableText from './EditableText'
import DeleteProjectDialog from './DeleteProjectDialog'
import { Uuid } from '@typed/uuid'
import { ProjectType, Item } from '../interfaces'
import { ProjectContainer, HeaderContainer, AddProjectContainer } from './styled/Project'
import ItemCreator from './ItemCreator'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { formatRelativeDate } from '../utils'
import { parseISO } from 'date-fns'
import ReorderableComponentList from './ReorderableComponentList'
import { Donut } from './Donut'
import { darken } from 'polished'
import { getItemsFromProject } from '../selectors/item'
import Tooltip from './Tooltip'

interface StateProps {
    theme: string
    items: Item
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

    function deleteProject(): void {
        props.deleteProject(props.project.id)
        history.push('/inbox')
        return
    }

    const allItems = Object.values(props.items)
    const completedItems = allItems.filter((i) => i.completed == true)

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <ProjectContainer>
                <HeaderContainer>
                    <div data-for="donut" data-tip>
                        <Donut
                            size={40}
                            progress={
                                allItems.length != 0
                                    ? (100 * completedItems.length) / allItems.length
                                    : 0
                            }
                            activeColour={themes[props.theme].colours.primaryColour}
                            inactiveColour={darken(
                                0.2,
                                themes[props.theme].colours.backgroundColour,
                            )}
                        />
                    </div>
                    <Tooltip
                        id="donut"
                        text={`${completedItems.length}/${allItems.length} completed`}
                    />
                    <EditableText
                        shouldSubmitOnBlur={true}
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
                <ReorderableComponentList id={props.project.id} />
            </ProjectContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state, props): StateProps => ({
    theme: state.ui.theme,
    items: getItemsFromProject(state, props),
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
        dispatch(deleteView(id))
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
