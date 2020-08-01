import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { connect } from 'react-redux'
import { Items, ProjectType } from '../interfaces'
import EditableText from './EditableText'
import { Header1, Paragraph, Header3 } from './Typography'
import { removeItemTypeFromString, formatRelativeDate } from '../utils'
import RRule from 'rrule'
import { parseISO } from 'date-fns'
import Button from './Button'
import Item from './Item'
import { ItemIcons } from '../interfaces/item'
import { hideFocusbar, setActiveItem, undoSetActiveItem } from '../actions/ui'
import {
    updateItemDescription,
    completeItem,
    uncompleteItem,
    setScheduledDate,
    setDueDate,
    setRepeatRule,
    moveItem,
    convertSubtask,
    changeParentItem,
    addLabel,
    removeLabel,
    deleteItem,
    undeleteItem,
} from '../actions'
import Tooltip from './Tooltip'
import {
    Container,
    HeaderContainer,
    TitleContainer,
    AttributeContainer,
    SubtaskContainer,
    AttributeValue,
    AttributeKey,
} from './styled/Focusbar'
import DatePicker from './DatePicker'
import RepeatPicker from './RepeatPicker'
import ProjectDropdown from './ProjectDropdown'
import ItemCreator from './ItemCreator'
import SubtaskDropdown from './SubtaskDropdown'
import LabelDropdown from './LabelDropdown'

interface DispatchProps {
    closeFocusbar: () => void
    setActiveItem: (id: string) => void
    updateItemDescription: (id: string, text: string) => void
    undoSetActiveItem: () => void
    moveItem: (id: string, projectId: string | '0') => void
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
    items: Items
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
                        <ProjectDropdown
                            deleted={i.deleted}
                            projectId={i.projectId}
                            completed={i.completed}
                            onSubmit={(projectId) => {
                                props.moveItem(i.id, projectId)
                            }}
                        />
                    </AttributeValue>
                </AttributeContainer>
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
                        <SubtaskDropdown
                            itemId={i.id}
                            parentId={i.parentId}
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
                        <LabelDropdown
                            completed={i.completed}
                            deleted={i.deleted}
                            labelId={i.labelId}
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
    activeItem: state.ui.activeItem,
    projects: state.projects,
    focusbarVisible: state.ui.focusbarVisible,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    moveItem: (id: string, projectId: string | '0') => {
        dispatch(moveItem(id, projectId))
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
