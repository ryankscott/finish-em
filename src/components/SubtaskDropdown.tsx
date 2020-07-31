import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { GroupType } from 'react-select'
import Select from 'react-select'
import { themes, selectStyles } from '../theme'

import { connect } from 'react-redux'
import { Item, Items, Projects, Project, ItemType } from '../interfaces'
import Button from './Button'
import { removeItemTypeFromString, truncateString, groupBy } from '../utils'
import { Container } from './styled/SubtaskDropdown'
import marked from 'marked'

type OptionType = { value: string; label: JSX.Element | string }

const generateOptions = (
    projects: Project,
    items: Item,
    item: ItemType,
): GroupType<OptionType>[] => {
    // Remove items that can't be a parent
    const filteredValues = Object.values(items).filter(
        (i) =>
            i.id != null &&
            i.id != item.id &&
            i.id != item.parentId &&
            i.deleted == false &&
            i.completed == false &&
            !i.parentId,
    )

    // Group them by project
    const groupedItems = groupBy(filteredValues, 'projectId')
    // Show the items from the project the item is in first

    // Update the label to be the project name, and the items to be the right format
    const allGroups = Object.keys(groupedItems).map((i) => {
        const group: GroupType<OptionType> = { label: '', options: [] }
        group['label'] = projects[i].name
        group['options'] = groupedItems[i].map((i) => {
            return {
                value: i.id,
                label: removeItemTypeFromString(i.text),
            }
        })
        return group
    })
    // Sort to ensure that the current project is at the front
    allGroups.sort((a, b) =>
        a.label == projects[item.projectId].name
            ? -1
            : b.label == projects[item.projectId].name
            ? 1
            : 0,
    )

    // If it's already a subtask add an option to create it to a task
    return item.parentId != null
        ? [
              {
                  label: 'Options',
                  options: [{ value: '', label: 'Convert to task' }],
              },
              ...allGroups,
          ]
        : allGroups
}

interface StateProps {
    items: Items
    projects: Projects
    theme: string
}
interface OwnProps {
    itemId: string
    parentId: string | undefined
    onSubmit: (value: string) => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    completed: boolean
    deleted?: boolean
    showSelect?: boolean
}

type SubtaskProps = StateProps & OwnProps
function SubtaskDropdown(props: SubtaskProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }
    const node = useRef<HTMLDivElement>()
    const parentText = props.items.items[props.parentId]?.text

    const handleClick = (e): null => {
        if (node.current.contains(e.target)) {
            return
        }
        setShowSelect(false)
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [])

    // Only render if it's not just the Inbox project that exists
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div ref={node}>
                <Button
                    isDisabled={props.deleted}
                    spacing="compact"
                    type={props.style || 'default'}
                    onClick={(e) => {
                        if (props.completed) return
                        setShowSelect(!showSelect)
                        e.stopPropagation()
                    }}
                    text={
                        parentText ? (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: marked(
                                        truncateString(
                                            removeItemTypeFromString(
                                                props.items.items[props.parentId]?.text,
                                            ),
                                            15,
                                        ),
                                    ),
                                }}
                            />
                        ) : (
                            'Add parent'
                        )
                    }
                    icon={'subtask'}
                />
                {(showSelect || props.showSelect) && (
                    <Container visible={Object.keys(props.items).length > 1}>
                        <Select
                            autoFocus={true}
                            placeholder={'Select parent:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(
                                props.projects.projects,
                                props.items.items,
                                props.items.items[props.itemId],
                            )}
                            styles={selectStyles({
                                fontSize: 'xxsmall',
                                theme: themes[props.theme],
                            })}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={true}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    setShowSelect(false)
                                    if (props.onEscape) {
                                        props.onEscape()
                                    }
                                }
                                e.stopPropagation()
                            }}
                        />
                    </Container>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    items: state.items,
    projects: state.projects,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): {} => ({})
export default connect(mapStateToProps, mapDispatchToProps)(SubtaskDropdown)
