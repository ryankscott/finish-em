import React, { Component, KeyboardEvent, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { RRule, rrulestr } from 'rrule'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { ItemType, ProjectType } from '../interfaces'
import {
  Body,
  Container,
  Project,
  QuickAdd,
  ExpandContainer,
  ScheduledContainer,
  DueContainer,
  RepeatContainer,
  TypeContainer,
} from './styled/Item'

import {
  addChildItem,
  createItem,
  moveItem,
  updateItemDescription,
  completeItem,
  deleteItem,
  undeleteItem,
  uncompleteItem,
  setScheduledDate,
  setRepeatRule,
  setDueDate,
} from '../actions'
import { theme } from '../theme'
import ProjectDropdown from './ProjectDropdown'
import EditableItem from './EditableItem'
import DatePicker from './DatePicker'
import RepeatPicker from './RepeatPicker'
import EditableText from './EditableText'
import DateRenderer from './DateRenderer'
import {
  getProjectNameById,
  removeItemTypeFromString,
  formatRelativeDate,
  getItemById,
} from '../utils'
import { parseISO } from 'date-fns'
import { Button } from './Button'

interface ItemProps extends ItemType {
  noIndentOnSubtasks: boolean
  showProject: boolean
  keymap: {}
  projects: ProjectType[]
  items: ItemType[]
  updateItemDescription: (id: Uuid, text: string) => void
  setRepeatRule: (id: Uuid, rule: RRule) => void
  setScheduledDate: (id: Uuid, date: Date) => void
  setDueDate: (id: Uuid, date: Date) => void
  completeItem: (id: Uuid) => void
  uncompleteItem: (id: Uuid) => void
  moveItem: (id: Uuid, projectId: Uuid) => void
  createSubTask: (id: Uuid, text: string, projectId: Uuid) => void
  deleteItem: (id: Uuid) => void
  undeleteItem: (id: Uuid) => void
}

interface ItemState {
  projectDropdownVisible: boolean
  scheduledDateDropdownVisible: boolean
  dueDateDropdownVisible: boolean
  repeatDropdownVisible: boolean
  descriptionEditable: boolean
  quickAddContainerVisible: boolean
  keyPresses: string[]
  hideChildren: boolean
}

class Item extends Component<ItemProps, ItemState> {
  private quickAdd: React.RefObject<HTMLInputElement>
  private container: React.RefObject<HTMLInputElement>
  private editor: React.RefObject<HTMLInputElement>
  handlers: {}
  constructor(props: ItemProps) {
    super(props)
    this.state = {
      projectDropdownVisible: false,
      scheduledDateDropdownVisible: false,
      dueDateDropdownVisible: false,
      repeatDropdownVisible: false,
      descriptionEditable: false,
      quickAddContainerVisible: false,
      hideChildren: true,
      keyPresses: [],
    }
    this.setScheduledDate = this.setScheduledDate.bind(this)
    this.setDueDate = this.setDueDate.bind(this)
    this.setRepeatRule = this.setRepeatRule.bind(this)
    this.moveItem = this.moveItem.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleExpand = this.handleExpand.bind(this)
    this.handleIconClick = this.handleIconClick.bind(this)
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this)
    this.quickAdd = React.createRef<HTMLInputElement>()
    this.editor = React.createRef<HTMLInputElement>()
    this.container = React.createRef<HTMLInputElement>()
    this.handlers = {
      TODO: {
        NEXT_ITEM: (event) => {
          // If it's a parent element we need to get the first child
          if (this.props.children.length > 0) {
            const nextItem = event.target.parentNode.nextSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.nextSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
            // If it's the last child
            else {
              const nextItem =
                event.target.parentNode.parentNode.nextSibling.firstChild
              if (nextItem) {
                nextItem.firstChild.focus()
                return
              }
            }
          }
          const parent = event.target.parentNode.parentNode
          const nextItem = parent.nextSibling
          if (nextItem) {
            nextItem.firstChild.firstChild.focus()
            return
          }
        },
        PREV_ITEM: (event) => {
          if (this.props.children.length > 0) {
            const prevItem = event.target.parentNode.previousSibling
            if (prevItem) {
              prevItem.firstChild.focus()
              return
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.previousSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
            // If it's the last child
            else {
              const prevItem =
                event.target.parentNode.parentNode.previousSibling.firstChild
              if (prevItem) {
                prevItem.firstChild.focus()
                return
              }
            }
          }
          // TODO: Fix issue for first item
          const parent = event.target.parentNode.parentNode
          const prevItem = parent.previousSibling.firstChild
          if (prevItem) {
            prevItem.firstChild.focus()
            return
          }
        },
        TOGGLE_CHILDREN: () => {
          this.state.hideChildren
            ? this.setState({ hideChildren: false })
            : this.setState({ hideChildren: true })
        },
        SET_SCHEDULED_DATE: (event) => {
          if (this.props.deleted || this.props.completed) return
          this.setState({
            scheduledDateDropdownVisible: !this.state
              .scheduledDateDropdownVisible,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false,
          })
          event.preventDefault()
        },
        SET_DUE_DATE: (event) => {
          if (this.props.deleted || this.props.completed) return
          this.setState({
            dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
            scheduledDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false,
          })
          event.preventDefault()
        },
        CREATE_SUBTASK: (event) => {
          if (this.props.deleted || this.props.completed) return
          this.setState({
            quickAddContainerVisible: !this.state.quickAddContainerVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
            repeatDropdownVisible: false,
          })
          this.quickAdd.current.focus()
          event.preventDefault()
        },
        COMPLETE_ITEM: () => {
          if (this.props.deleted || this.props.completed) return
          this.props.completeItem(this.props.id)
        },
        UNCOMPLETE_ITEM: () => {
          if (this.props.deleted) return
          this.props.uncompleteItem(this.props.id)
        },
        REPEAT_ITEM: (event) => {
          if (this.props.deleted || this.props.completed) return
          this.setState({
            repeatDropdownVisible: !this.state.repeatDropdownVisible,
            scheduledDateDropdownVisible: false,
            dueDateDropdownVisible: false,
            projectDropdownVisible: false,
          })
          event.preventDefault()
        },
        DELETE_ITEM: () => {
          if (this.props.deleted) return
          this.props.deleteItem(this.props.id)
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.id)
        },
        MOVE_ITEM: (event) => {
          if (this.props.deleted || this.props.completed) return
          this.setState({
            projectDropdownVisible: !this.state.projectDropdownVisible,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            repeatDropdownVisible: false,
          })
          event.preventDefault()
        },
        ESCAPE: () => {
          this.setState({
            projectDropdownVisible: false,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            descriptionEditable: false,
            repeatDropdownVisible: false,
          })
          this.container.current.focus()
        },
        EDIT_ITEM_DESC: (event) => {
          this.editor.current.focus()
          event.preventDefault()
        },
      },
      NOTE: {
        NEXT_ITEM: (event) => {
          // If it's a parent element we need to get the first child
          if (this.props.children.length > 0) {
            const nextItem = event.target.parentNode.nextSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.nextSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
            // If it's the last child
            else {
              const nextItem =
                event.target.parentNode.parentNode.nextSibling.firstChild
              if (nextItem) {
                nextItem.firstChild.focus()
                return
              }
            }
          }
          const parent = event.target.parentNode.parentNode
          const nextItem = parent.nextSibling
          if (nextItem) {
            nextItem.firstChild.firstChild.focus()
            return
          }
        },
        PREV_ITEM: (event) => {
          if (this.props.children.length > 0) {
            const prevItem = event.target.parentNode.previousSibling
            if (prevItem) {
              prevItem.firstChild.focus()
              return
            }
          }
          // If it's a child
          if (this.props.parentId != null) {
            const nextItem = event.target.parentNode.previousSibling
            if (nextItem) {
              nextItem.firstChild.focus()
              return
            }
            // If it's the last child
            else {
              const prevItem =
                event.target.parentNode.parentNode.previousSibling.firstChild
              if (prevItem) {
                prevItem.firstChild.focus()
                return
              }
            }
          }
          // TODO: Fix issue for first item
          const parent = event.target.parentNode.parentNode
          const prevItem = parent.previousSibling.firstChild
          if (prevItem) {
            prevItem.firstChild.focus()
            return
          }
        },
        DELETE_ITEM: () => {
          this.props.deleteItem(this.props.id)
        },
        UNDELETE_ITEM: () => {
          this.props.undeleteItem(this.props.id)
        },
        MOVE_ITEM: (event) => {
          this.setState({
            projectDropdownVisible: !this.state.projectDropdownVisible,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            repeatDropdownVisible: false,
          })
          event.preventDefault()
        },
        ESCAPE: () => {
          this.setState({
            projectDropdownVisible: false,
            dueDateDropdownVisible: false,
            scheduledDateDropdownVisible: false,
            descriptionEditable: false,
            repeatDropdownVisible: false,
          })
        },
        EDIT_ITEM_DESC: (event) => {
          this.editor.current.focus()
          event.preventDefault()
        },
      },
    }
  }

  handleDescriptionChange(text: string): void {
    this.props.updateItemDescription(
      this.props.id,
      this.props.type.concat(' ', text),
    )
    return
  }

  showDueDateDropdown(): void {
    this.setState({
      dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
      scheduledDateDropdownVisible: false,
      projectDropdownVisible: false,
      repeatDropdownVisible: false,
    })
    this.setState({
      dueDateDropdownVisible: !this.state.dueDateDropdownVisible,
    })
    return
  }

  setRepeatRule(r: RRule): void {
    this.props.setRepeatRule(this.props.id, r)
    this.setState({ repeatDropdownVisible: false })
    return
  }

  setScheduledDate(d: Date): void {
    this.props.setScheduledDate(this.props.id, d)
    this.setState({ scheduledDateDropdownVisible: false })
    return
  }

  setDueDate(d: Date): void {
    this.props.setDueDate(this.props.id, d)
    this.setState({ dueDateDropdownVisible: false })
    return
  }

  moveItem(projectId: Uuid): void {
    this.props.moveItem(this.props.id, projectId)
    this.setState({ projectDropdownVisible: false })
    return
  }

  createSubTask(text: string): void {
    this.props.createSubTask(this.props.id, text, this.props.projectId)
    this.setState({ quickAddContainerVisible: false })
    return
  }

  // TODO: Refactor the shit out of this
  handleKeyPress(event: KeyboardEvent<HTMLDivElement>): void {
    let currentKeyPresses = this.state.keyPresses
    // Remove the first value in the array (3 is the max shortcut matching length)
    currentKeyPresses =
      currentKeyPresses.length >= 3
        ? currentKeyPresses.slice(1)
        : currentKeyPresses
    currentKeyPresses.push(event.key)

    // Clear keypress history if using the arrow keys. Enables quick scrolling
    if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {
      setTimeout(() => {
        this.setState({
          keyPresses: [],
        })
      }, 200)
      // After 1s remove the first item in the array
    } else {
      this.setState({}, () => {
        setTimeout(() => {
          this.setState({
            keyPresses: this.state.keyPresses.slice(1),
          })
        }, 500)
      })
    }
    // TODO handle not matching
    // TODO handle multiple key bindings for each action
    for (const [key, value] of Object.entries(this.props.keymap)) {
      currentKeyPresses.forEach((k, v) => {
        if (v < currentKeyPresses.length) {
          const combo = k + ' ' + currentKeyPresses[v + 1]
          if (combo == value) {
            const handler = this.handlers[this.props.type][key]
            handler ? handler(event) : null
            return
          }
          const single = k
          if (single == value) {
            const handler = this.handlers[this.props.type][key]
            handler ? handler(event) : null
            return
          }
        }
      })
    }
    return
  }

  handleIconClick(): void {
    if (this.props.type == 'TODO') {
      this.props.completed
        ? this.props.uncompleteItem(this.props.id)
        : this.props.completeItem(this.props.id)
    }
    return
  }

  handleExpand(): void {
    this.state.hideChildren
      ? this.setState({
          hideChildren: false,
        })
      : this.setState({ hideChildren: true })
    return
  }

  render(): ReactElement {
    const repeat = this.props.repeat ? rrulestr(this.props.repeat).toText() : ''
    const dueDate = this.props.dueDate
      ? formatRelativeDate(parseISO(this.props.dueDate))
      : null
    const scheduledDate = this.props.scheduledDate
      ? formatRelativeDate(parseISO(this.props.scheduledDate))
      : null
    return (
      <ThemeProvider theme={theme}>
        <div key={this.props.id} id={this.props.id}>
          <Container
            ref={this.container}
            noIndentOnSubtasks={this.props.noIndentOnSubtasks}
            isSubtask={this.props.parentId != null}
            onKeyDown={this.handleKeyPress}
            id={this.props.id}
            tabIndex={0}
            itemType={this.props.type}
          >
            {this.props.children.length > 0 && (
              <ExpandContainer>
                <Button
                  type="default"
                  spacing="default"
                  onClick={this.handleExpand}
                  icon={this.state.hideChildren ? 'expand' : 'collapse'}
                ></Button>
              </ExpandContainer>
            )}
            <TypeContainer>
              <Button
                type="default"
                spacing="compact"
                onClick={this.handleIconClick}
                height="24px"
                width="24px"
                icon={
                  this.props.type == 'NOTE'
                    ? 'note'
                    : this.props.completed
                    ? 'todo_checked'
                    : 'todo_unchecked'
                }
              />
            </TypeContainer>
            <Body id="body" completed={this.props.completed}>
              <EditableText
                innerRef={this.editor}
                readOnly={this.props.completed}
                input={removeItemTypeFromString(this.props.text)}
                onUpdate={this.handleDescriptionChange}
                singleline={true}
              />
            </Body>
            {this.props.showProject && (
              <Project>
                {this.props.showProject
                  ? getProjectNameById(
                      this.props.projectId,
                      this.props.projects,
                    )
                  : 'null'}
              </Project>
            )}
            {this.props.scheduledDate && (
              <ScheduledContainer>
                <DateRenderer
                  completed={this.props.completed}
                  type="scheduled"
                  position="flex-start"
                  text={scheduledDate}
                  onClick={() =>
                    this.setState({
                      scheduledDateDropdownVisible: !this.state
                        .scheduledDateDropdownVisible,
                    })
                  }
                />
              </ScheduledContainer>
            )}
            {this.props.dueDate && (
              <DueContainer>
                <DateRenderer
                  completed={this.props.completed}
                  type="due"
                  position="center"
                  text={dueDate}
                  onClick={() =>
                    this.setState({
                      dueDateDropdownVisible: !this.state
                        .dueDateDropdownVisible,
                    })
                  }
                />
              </DueContainer>
            )}
            {this.props.repeat && (
              <RepeatContainer>
                <DateRenderer
                  completed={this.props.completed}
                  type="repeat"
                  position="flex-end"
                  text={repeat}
                  onClick={() =>
                    this.setState({
                      repeatDropdownVisible: !this.state.repeatDropdownVisible,
                    })
                  }
                />
              </RepeatContainer>
            )}
          </Container>
          <QuickAdd visible={this.state.quickAddContainerVisible}>
            <EditableItem
              text=""
              innerRef={this.quickAdd}
              readOnly={false}
              onSubmit={(text) => this.createSubTask(text)}
              onEscape={() =>
                this.setState({ quickAddContainerVisible: false })
              }
            />
          </QuickAdd>
          {this.state.scheduledDateDropdownVisible && (
            <DatePicker
              key={'sd' + this.props.id}
              placeholder={'Schedule to: '}
              onSubmit={this.setScheduledDate}
              onEscape={() =>
                this.setState({ scheduledDateDropdownVisible: false })
              }
            />
          )}
          {this.state.dueDateDropdownVisible && (
            <DatePicker
              key={'dd' + this.props.id}
              placeholder={'Due on: '}
              onSubmit={this.setDueDate}
              onEscape={() => this.setState({ dueDateDropdownVisible: false })}
            />
          )}
          {this.state.repeatDropdownVisible && (
            <RepeatPicker
              key={'rp' + this.props.id}
              placeholder={'Repeat: '}
              onSubmit={this.setRepeatRule}
              onEscape={() => this.setState({ repeatDropdownVisible: false })}
            />
          )}
          {this.state.projectDropdownVisible && (
            <ProjectDropdown
              key={'p' + this.props.id}
              placeholder={'Move to: '}
              onSubmit={this.moveItem}
              onEscape={() => this.setState({ projectDropdownVisible: false })}
            />
          )}
        </div>
        {!this.state.hideChildren &&
          this.props.children?.map((c) => {
            const childItem = getItemById(c, this.props.items)
            // Sometimes the child item has been filtered out, so we don't want to render an empty container
            if (!childItem) return
            return (
              <Item
                {...childItem}
                key={c}
                items={this.props.items}
                noIndentOnSubtasks={this.props.noIndentOnSubtasks}
                showProject={this.props.showProject}
                keymap={this.props.keymap}
                projects={this.props.projects}
                updateItemDescription={this.props.updateItemDescription}
                setScheduledDate={this.props.setScheduledDate}
                setDueDate={this.props.setDueDate}
                setRepeatRule={this.props.setRepeatRule}
                moveItem={this.props.moveItem}
                completeItem={this.props.completeItem}
                uncompleteItem={this.props.uncompleteItem}
                createSubTask={this.props.createSubTask}
                deleteItem={this.props.deleteItem}
                undeleteItem={this.props.undeleteItem}
              />
            )
          })}
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  projects: state.projects,
  items: state.items,
})
const mapDispatchToProps = (dispatch) => ({
  createSubTask: (parentId: Uuid, text: string, projectId: Uuid) => {
    const childId = uuidv4()
    dispatch(createItem(childId, text, projectId))
    dispatch(addChildItem(childId, parentId))
  },
  updateItemDescription: (id: Uuid, text: string) => {
    dispatch(updateItemDescription(id, text))
  },
  uncompleteItem: (id: Uuid) => {
    dispatch(uncompleteItem(id))
  },
  completeItem: (id: Uuid) => {
    dispatch(completeItem(id))
  },
  undeleteItem: (id: Uuid) => {
    dispatch(undeleteItem(id))
  },
  deleteItem: (id: Uuid) => {
    dispatch(deleteItem(id))
  },
  moveItem: (id: Uuid, projectId: Uuid) => {
    dispatch(moveItem(id, projectId))
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
})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
