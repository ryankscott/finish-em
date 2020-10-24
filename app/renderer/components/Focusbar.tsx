import { parseISO } from 'date-fns'
import marked from 'marked'
import { transparentize } from 'polished'
import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import RRule from 'rrule'
import {
    addArea,
    addLabel,
    addProject,
    changeParentItem,
    completeItem,
    convertSubtask,
    deleteItem,
    removeLabel,
    setDueDate,
    setRepeatRule,
    setScheduledDate,
    uncompleteItem,
    undeleteItem,
    updateItemDescription,
} from '../actions'
import { hideFocusbar, setActiveItem, undoSetActiveItem } from '../actions/ui'
import { Areas, Items, ProjectType } from '../interfaces'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import {
    formatRelativeDate,
    groupBy,
    removeItemTypeFromString,
    truncateString,
    markdownLinkRegex,
    markdownBasicRegex,
} from '../utils'
import Button from './Button'
import ButtonDropdown from './ButtonDropdown'
import DatePicker from './DatePicker'
import EditableText from './EditableText'
import Item from './Item'
import ItemCreator from './ItemCreator'
import RepeatPicker from './RepeatPicker'
import {
    AttributeContainer,
    AttributeKey,
    AttributeValue,
    Container,
    HeaderContainer,
    SubtaskContainer,
    TitleContainer,
} from './styled/Focusbar'
import Tooltip from './Tooltip'
import { Header1, Header3, Paragraph } from './Typography'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Color }
const generateLabelOptions = (labels: Label): OptionType[] => {
    return [
        ...Object.values(labels).map((l) => {
            return {
                value: l.id,
                label: l.name,
                color: transparentize(0.8, l.colour),
            }
        }),
        { value: '', label: 'No label', color: '' },
    ]
}
const generateSubtaskOptions = (
    projects: Project,
    items: Item,
    currentItem: ItemType,
): GroupType<OptionType>[] => {
    const filteredValues = Object.values(items).filter(
        (i) =>
            i.id != null &&
            i.id != currentItem.id &&
            i.id != currentItem.parentId &&
            i.deleted == false &&
            i.completed == false &&
            !i.parentId,
    )
    // Return if we've filtered all items
    if (!filteredValues.length) return
    // Group them by project
    const groupedItems = groupBy(filteredValues, 'projectId')
    // Show the items from the project the item is in first
    // Update the label to be the project name, and the items to be the right format
    const allGroups = Object.keys(groupedItems).map((i) => {
        const group: GroupType<OptionType> = { label: '', options: [] }
        // It's possible to not have a project
        group['label'] = i == 'null' ? 'No Project' : projects[i].name
        group['options'] = groupedItems[i].map((i) => {
            return {
                value: i.id,
                label: removeItemTypeFromString(i.text)
                    .replace(markdownLinkRegex, '$1')
                    .replace(markdownBasicRegex, '$1'),
            }
        })
        return group
    })
    // Sort to ensure that the current project is at the front
    allGroups.sort((a, b) => {
        if (!currentItem.projectId) return 0
        return a.label == projects[currentItem.projectId].name
            ? -1
            : b.label == projects[currentItem.projectId].name
            ? 1
            : 0
    })

    // If it's already a subtask add an option to create it to a task
    return currentItem.parentId != null
        ? [
              {
                  label: 'Options',
                  options: [{ value: '', label: 'Convert to task' }],
              },
              ...allGroups,
          ]
        : allGroups
}
const generateProjectOptions = (
    project: ProjectType,
    areas: Area,
    projects: Project,
): GroupType<OptionType>[] => {
    const p = Object.values(projects)
    const filteredProjects = p
        .filter((p) => p.id != '0')
        .filter((p) => p.id != null)
        .filter((p) => p.id != project?.id)
        .filter((p) => p.deleted == false)

    const groupedProjects = groupBy(filteredProjects, 'areaId')
    const allGroups = Object.keys(groupedProjects).map((i) => {
        const group: GroupType<OptionType> = { label: '', options: [] }
        group['label'] = areas[i].name
        group['options'] = groupedProjects[i].map((p) => {
            return {
                value: p.id,
                label: p.name,
            }
        })
        return group
    })

    // Sort to ensure that the current project is at the front
    // Only if it has a project
    if (project != null) {
        allGroups.sort((a, b) =>
            a.label == areas[project.areaId].name
                ? -1
                : b.label == areas[project.areaId].name
                ? 1
                : 0,
        )
    }
    //
    return [
        ...allGroups,
        {
            label: 'Remove Project',
            options: [{ value: null, label: 'None' }],
        },
    ]
}
const generateAreaOptions = (area: AreaType, areas: Area): OptionsType => {
    const a = Object.values(areas)
    const filteredAreas = a.filter((a) => a.id != area?.id).filter((a) => a.deleted == false)

    return [
        ...filteredAreas.map((a) => {
            return {
                value: a.id,
                label: a.name,
            }
        }),
        { value: null, label: 'None' },
    ]
}

interface DispatchProps {
    closeFocusbar: () => void
    setActiveItem: (id: string) => void
    updateItemDescription: (id: string, text: string) => void
    undoSetActiveItem: () => void
    addProject: (id: string, projectId: string | '0') => void
    addArea: (id: string, areaId: string | '0') => void
    completeItem: (id: string) => void
    uncompleteItem: (id: string) => void
    setScheduledDate: (id: string, date: string) => void
    setDueDate: (id: string, date: string) => void
    setRepeatRule: (id: string, rule: RRule) => void
    convertSubtask: (id: string) => void
    changeParentItem: (id: string, parentId: string) => void
    addLabel: (id: string, labelId: string | string) => void
    deleteItem: (id: string) => void
    undeleteItem: (id: string) => void
    removeLabel: (id: string) => void
}
interface StateProps {
    areas: Areas
    items: Items
    labels: Labels
    projects: ProjectType[]
    activeItem: {
        past: string[]
        present: string
        future: string[]
    }
    focusbarVisible: boolean
    theme: string
}
type FocusbarProps = DispatchProps & StateProps
const Focusbar = (props: FocusbarProps): ReactElement => {
    const ref = React.useRef<HTMLInputElement>()
    const i = props?.items?.items[props?.activeItem.present]
    if (!i) return null

    // TODO: Do I need these? Or can I move to the component
    const dueDate = i.dueDate ? formatRelativeDate(parseISO(i.dueDate)) : 'Add due date'
    const scheduledDate = i.scheduledDate
        ? formatRelativeDate(parseISO(i.scheduledDate))
        : 'Schedule'

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                <HeaderContainer visible={props.focusbarVisible}>
                    {props.activeItem?.past?.length > 0 && (
                        <div style={{ gridArea: 'BACK' }}>
                            <Button
                                dataFor="back-button"
                                type="default"
                                spacing="compact"
                                onClick={() => props.undoSetActiveItem()}
                                icon={'back'}
                            ></Button>
                            <Tooltip id="back-button" text={'Back'} />
                        </div>
                    )}
                    {i.parentId != null && (
                        <div style={{ gridArea: 'UP' }}>
                            <Button
                                dataFor="up-button"
                                type="default"
                                spacing="compact"
                                onClick={() => props.setActiveItem(i.parentId)}
                                icon={'upLevel'}
                            ></Button>
                            <Tooltip id="up-button" text={'Up level'} />
                        </div>
                    )}
                    <div
                        style={{
                            gridArea: 'CLOSE',
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <Button
                            type="default"
                            spacing="compact"
                            onClick={props.closeFocusbar}
                            icon={'close'}
                        />
                    </div>
                </HeaderContainer>
                <TitleContainer>
                    <Button
                        type={'default'}
                        spacing="compact"
                        height="26px"
                        width="26px"
                        onClick={() => {
                            if (i.type == 'TODO') {
                                i.completed ? props.uncompleteItem(i.id) : props.completeItem(i.id)
                            }
                        }}
                        icon={
                            i.type == 'NOTE'
                                ? 'note'
                                : i.completed
                                ? 'todoChecked'
                                : 'todoUnchecked'
                        }
                    />
                    <EditableText
                        key={i.id}
                        innerRef={ref}
                        style={Header1}
                        input={removeItemTypeFromString(i.text)}
                        singleline={true}
                        onUpdate={(text) => {
                            props.updateItemDescription(i.id, i.type.concat(' ', text))
                        }}
                        shouldSubmitOnBlur={true}
                        shouldClearOnSubmit={false}
                    />
                    {i.deleted ? (
                        <>
                            <Button
                                dataFor="restore-button"
                                type={'default'}
                                icon="restore"
                                height="26px"
                                width="26px"
                                spacing="compact"
                                onClick={() => {
                                    props.undeleteItem(i.id)
                                }}
                            ></Button>
                            <Tooltip id="restore-button" text={'Restore'} />{' '}
                        </>
                    ) : (
                        <>
                            <Button
                                dataFor="delete-button"
                                type={'default'}
                                icon="trash"
                                spacing="compact"
                                height="26px"
                                width="26px"
                                onClick={() => {
                                    props.deleteItem(i.id)
                                }}
                            ></Button>

                            <Tooltip id="delete-button" text={'Delete'} />
                        </>
                    )}
                </TitleContainer>

                <AttributeContainer>
                    <AttributeKey>
                        <Paragraph>Project: </Paragraph>
                    </AttributeKey>
                    <AttributeValue>
                        <ButtonDropdown
                            buttonText={props.projects.projects[i.projectId]?.name}
                            defaultButtonIcon={'project'}
                            defaultButtonText={'Add Project'}
                            selectPlaceholder={'Search for project'}
                            options={generateProjectOptions(
                                props.projects.projects[i.projectId],
                                props.areas.areas,
                                props.projects.projects,
                            )}
                            deleted={i.deleted}
                            projectId={i.projectId}
                            completed={i.completed}
                            onSubmit={(projectId) => {
                                props.addProject(i.id, projectId)
                            }}
                        />
                    </AttributeValue>
                </AttributeContainer>
                {(i.projectId == null || i.projectId == 0) && (
                    <AttributeContainer>
                        <AttributeKey>
                            <Paragraph>Area: </Paragraph>
                        </AttributeKey>
                        <AttributeValue>
                            <ButtonDropdown
                                buttonText={i.areaId ? props.areas.areas[i.areaId].name : null}
                                defaultButtonIcon={'area'}
                                defaultButtonText={'Add Area'}
                                selectPlaceholder={'Search for area'}
                                options={generateAreaOptions(
                                    props.areas.areas[i.areaId],
                                    props.areas.areas,
                                )}
                                deleted={i.deleted}
                                areaId={i.areaId}
                                completed={i.completed}
                                onSubmit={(projectId) => {
                                    props.addArea(i.id, projectId)
                                }}
                            />
                        </AttributeValue>
                    </AttributeContainer>
                )}
                {i.type == 'TODO' && (
                    <>
                        <AttributeContainer>
                            <AttributeKey>
                                <Paragraph>Scheduled: </Paragraph>
                            </AttributeKey>
                            <AttributeValue>
                                <DatePicker
                                    key={'sd' + i.id}
                                    placeholder={'Scheduled on: '}
                                    onSubmit={(d) => props.setScheduledDate(i.id, d)}
                                    icon="scheduled"
                                    text={scheduledDate}
                                    completed={i.completed}
                                    deleted={i.deleted}
                                />
                            </AttributeValue>
                        </AttributeContainer>
                        <AttributeContainer>
                            <AttributeKey>
                                <Paragraph>Due: </Paragraph>
                            </AttributeKey>
                            <AttributeValue>
                                <DatePicker
                                    key={'dd' + i.id}
                                    placeholder={'Due on: '}
                                    onSubmit={(d) => props.setDueDate(i.id, d)}
                                    icon="due"
                                    text={dueDate}
                                    completed={i.completed}
                                    deleted={i.deleted}
                                />
                            </AttributeValue>
                        </AttributeContainer>
                        <AttributeContainer>
                            <AttributeKey>
                                <Paragraph>Repeating: </Paragraph>
                            </AttributeKey>
                            <AttributeValue>
                                <RepeatPicker
                                    repeat={i.repeat ? RRule.fromString(i.repeat) : null}
                                    completed={i.completed}
                                    deleted={i.deleted}
                                    key={'rp' + i.id}
                                    placeholder={'Repeat: '}
                                    onSubmit={(r) => props.setRepeatRule(i.id, r)}
                                />
                            </AttributeValue>
                        </AttributeContainer>
                    </>
                )}
                <AttributeContainer>
                    <AttributeKey>
                        <Paragraph>Parent:</Paragraph>
                    </AttributeKey>
                    <AttributeValue>
                        <ButtonDropdown
                            buttonText={
                                props.items.items[i.parentId] ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: marked(
                                                truncateString(
                                                    removeItemTypeFromString(
                                                        props.items.items[i.parentId]?.text,
                                                    ),
                                                    15,
                                                ),
                                            ),
                                        }}
                                    />
                                ) : null
                            }
                            defaultButtonIcon={'subtask'}
                            defaultButtonText={'Add Parent'}
                            selectPlaceholder={'Select parent'}
                            options={generateSubtaskOptions(
                                props.projects.projects,
                                props.items.items,
                                i,
                            )}
                            completed={i.completed}
                            deleted={i.deleted}
                            onSubmit={(parentId) => {
                                if (parentId) {
                                    props.changeParentItem(i.id, parentId)
                                } else {
                                    props.convertSubtask(i.id)
                                }
                            }}
                        />
                    </AttributeValue>
                </AttributeContainer>
                <AttributeContainer>
                    <AttributeKey>
                        <Paragraph>Label:</Paragraph>
                    </AttributeKey>
                    <AttributeValue>
                        <ButtonDropdown
                            buttonText={props.labels.labels[i.labelId]?.name}
                            buttonIconColour={props.labels.labels[i.labelId]?.colour}
                            defaultButtonIcon={'label'}
                            defaultButtonText={'Add Label'}
                            selectPlaceholder={'Search for label'}
                            options={generateLabelOptions(props.labels.labels)}
                            completed={i.completed}
                            deleted={i.deleted}
                            onSubmit={(labelId) => {
                                if (labelId) {
                                    props.addLabel(i.id, labelId)
                                } else {
                                    props.removeLabel(i.id)
                                }
                            }}
                        />
                    </AttributeValue>
                </AttributeContainer>
                {i.deleted && (
                    <AttributeContainer>
                        <AttributeKey>
                            <Paragraph>Deleted date: </Paragraph>
                        </AttributeKey>
                        <AttributeValue>
                            <div style={{ margin: '2px', padding: '5px 8px' }}>
                                {formatRelativeDate(parseISO(i.deletedAt))}
                            </div>
                        </AttributeValue>
                    </AttributeContainer>
                )}
                {i.completed && (
                    <AttributeContainer>
                        <AttributeKey>
                            <Paragraph>Completed date: </Paragraph>
                        </AttributeKey>
                        <AttributeValue>
                            <div style={{ margin: '2px', padding: '5px 8px' }}>
                                {formatRelativeDate(parseISO(i.completedAt))}
                            </div>
                        </AttributeValue>
                    </AttributeContainer>
                )}
                {i.parentId == null && i.type == 'TODO' && (
                    <>
                        <SubtaskContainer>
                            <Header3>Subtasks: </Header3>
                            <ItemCreator type="subtask" parentId={i.id} initiallyExpanded={false} />
                        </SubtaskContainer>
                        <Tooltip id="add-subtask" text="Add subtask"></Tooltip>
                    </>
                )}
                {i.children?.map((c) => {
                    const childItem = props.items.items[c]
                    if (!childItem) return
                    return (
                        <Item
                            {...childItem}
                            key={c}
                            noIndentOnSubtasks={true}
                            alwaysVisible={true}
                            hideIcons={[
                                ItemIcons.Due,
                                ItemIcons.Scheduled,
                                ItemIcons.Repeat,
                                ItemIcons.Project,
                                ItemIcons.Subtask,
                            ]}
                        />
                    )
                })}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    items: state.items,
    areas: state.areas,
    labels: state.ui.labels,
    activeItem: state.ui.activeItem,
    projects: state.projects,
    focusbarVisible: state.ui.focusbarVisible,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    addProject: (id: string, projectId: string | '0') => {
        dispatch(addProject(id, projectId))
    },
    addArea: (id: string, areaId: string | '0') => {
        dispatch(addArea(id, areaId))
    },
    completeItem: (id: string) => {
        dispatch(completeItem(id))
    },
    uncompleteItem: (id: string) => {
        dispatch(uncompleteItem(id))
    },
    updateItemDescription: (id: string, text: string) => {
        dispatch(updateItemDescription(id, text))
    },
    closeFocusbar: () => {
        dispatch(hideFocusbar())
    },
    setActiveItem: (id: string) => {
        dispatch(setActiveItem(id))
    },
    undoSetActiveItem: () => {
        dispatch(undoSetActiveItem())
    },
    setScheduledDate: (id: string, date: string) => {
        dispatch(setScheduledDate(id, date))
    },
    setDueDate: (id: string, date: string) => {
        dispatch(setDueDate(id, date))
    },
    setRepeatRule: (id: string, rule: RRule) => {
        dispatch(setRepeatRule(id, rule))
    },
    convertSubtask: (id: string) => {
        dispatch(convertSubtask(id))
    },
    changeParentItem: (id: string, parentId: string) => {
        dispatch(changeParentItem(id, parentId))
    },
    addLabel: (id: string, labelId: string | string) => {
        dispatch(addLabel(id, labelId))
    },
    removeLabel: (id: string) => {
        dispatch(removeLabel(id))
    },
    deleteItem: (id: string) => {
        dispatch(deleteItem(id))
    },
    undeleteItem: (id: string) => {
        dispatch(undeleteItem(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Focusbar)
