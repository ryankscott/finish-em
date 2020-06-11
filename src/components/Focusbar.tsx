import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { connect } from 'react-redux'
import { Items, ProjectType } from '../interfaces'
import { Uuid } from '@typed/uuid'
import EditableText from './EditableText'
import { Header1, Paragraph, Header3 } from './Typography'
import { removeItemTypeFromString, formatRelativeDate } from '../utils'
import RRule from 'rrule'
import { parseISO } from 'date-fns'
import Button from './Button'
import Item, { ItemIcons } from './Item'
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
    deleteLabel,
    deleteItem,
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
} from './styled/FocusBar'
import DatePicker from './DatePicker'
import RepeatPicker from './RepeatPicker'
import ProjectDropdown from './ProjectDropdown'
import ItemCreator from './ItemCreator'
import SubtaskDropdown from './SubtaskDropdown'
import LabelDropdown from './LabelDropdown'

interface DispatchProps {
    closeFocusbar: () => void
    setActiveItem: (id: Uuid) => void
    updateItemDescription: (id: Uuid, text: string) => void
    undoSetActiveItem: () => void
    moveItem: (id: Uuid, projectId: Uuid | '0') => void
    completeItem: (id: Uuid) => void
    uncompleteItem: (id: Uuid) => void
    setScheduledDate: (id: Uuid, date: string) => void
    setDueDate: (id: Uuid, date: string) => void
    setRepeatRule: (id: Uuid, rule: RRule) => void
    convertSubtask: (id: Uuid) => void
    changeParentItem: (id: Uuid, parentId: Uuid) => void
    addLabel: (id: Uuid, labelId: Uuid | string) => void
    deleteItem: (id: Uuid) => void
    deleteLabel: (id: Uuid) => void
}
interface StateProps {
    items: Items
    projects: ProjectType[]
    activeItem: {
        past: Uuid[]
        present: Uuid
        future: Uuid[]
    }
    focusbarVisible: boolean
    theme: string
}
type FocusbarProps = DispatchProps & StateProps
const Focusbar = (props: FocusbarProps): ReactElement => {
    const ref = React.createRef<HTMLInputElement>()
    const i = props?.items?.items[props?.activeItem.present]
    if (!i) return null

    // TODO: Do I need these? Or can I move to the component
    const dueDate = i.dueDate ? formatRelativeDate(parseISO(i.dueDate)) : 'Add due date'
    const scheduledDate = i.scheduledDate
        ? formatRelativeDate(parseISO(i.scheduledDate))
        : 'Schedule'
    const parentText = i.parentId
        ? removeItemTypeFromString(props.items.items[i.parentId].text)
        : 'Convert to subtask'

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
                        height="24px"
                        width="24px"
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
                        validation={{ validate: false }}
                        shouldSubmitOnBlur={true}
                        shouldClearOnSubmit={false}
                    />
                    <Button
                        dataFor="delete-button"
                        type={'default'}
                        icon="trash"
                        spacing="compact"
                        onClick={() => {
                            props.deleteItem(i.id)
                        }}
                    ></Button>

                    <Tooltip id="delete-button" text={'Delete'} />
                </TitleContainer>

                <AttributeContainer>
                    <AttributeKey>
                        <Paragraph>Project: </Paragraph>
                    </AttributeKey>
                    <AttributeValue>
                        <ProjectDropdown
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
                                />
                            </AttributeValue>
                        </AttributeContainer>
                        <AttributeContainer>
                            <AttributeKey>
                                <Paragraph>Repeating: </Paragraph>
                            </AttributeKey>
                            <AttributeValue>
                                <RepeatPicker
                                    id={i.id}
                                    repeat={i.repeat ? RRule.fromString(i.repeat) : null}
                                    completed={i.completed}
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
                            text={parentText}
                            parentId={i.parentId}
                            completed={i.completed}
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
                            labelId={i.labelId}
                            onSubmit={(labelId) => {
                                if (labelId) {
                                    props.addLabel(i.id, labelId)
                                } else {
                                    props.deleteLabel(i.id)
                                }
                            }}
                        />
                    </AttributeValue>
                </AttributeContainer>
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
    moveItem: (id: Uuid, projectId: Uuid | '0') => {
        dispatch(moveItem(id, projectId))
    },
    completeItem: (id: Uuid) => {
        dispatch(completeItem(id))
    },
    uncompleteItem: (id: Uuid) => {
        dispatch(uncompleteItem(id))
    },
    updateItemDescription: (id: Uuid, text: string) => {
        dispatch(updateItemDescription(id, text))
    },
    closeFocusbar: () => {
        dispatch(hideFocusbar())
    },
    setActiveItem: (id: Uuid) => {
        dispatch(setActiveItem(id))
    },
    undoSetActiveItem: () => {
        dispatch(undoSetActiveItem())
    },
    setScheduledDate: (id: Uuid, date: string) => {
        dispatch(setScheduledDate(id, date))
    },
    setDueDate: (id: Uuid, date: string) => {
        dispatch(setDueDate(id, date))
    },
    setRepeatRule: (id: Uuid, rule: RRule) => {
        dispatch(setRepeatRule(id, rule))
    },
    convertSubtask: (id: Uuid) => {
        dispatch(convertSubtask(id))
    },
    changeParentItem: (id: Uuid, parentId: Uuid) => {
        dispatch(changeParentItem(id, parentId))
    },
    addLabel: (id: Uuid, labelId: Uuid | string) => {
        dispatch(addLabel(id, labelId))
    },
    deleteLabel: (id: Uuid) => {
        dispatch(deleteLabel(id))
    },
    deleteItem: (id: Uuid) => {
        dispatch(deleteItem(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Focusbar)
