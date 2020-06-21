import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import { OptionsType } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { themes, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'

import { connect } from 'react-redux'
import { Item, Items, Projects } from '../interfaces'
import Button from './Button'
import { removeItemTypeFromString } from '../utils'
import { Container } from './styled/SubtaskDropdown'
import marked from 'marked'

type OptionType = { value: string; label: JSX.Element | string }

const generateOptions = (
    options: Item,
    projects: Projects,
    parentId: Uuid,
    itemId: Uuid,
): { label: string; options: OptionsType<OptionType> }[] => {
    const getItemText = (text: string, projectId: Uuid | '0', projects: Projects): string => {
        const longText = `[${projects.projects[projectId].name}] ${removeItemTypeFromString(text)}`
        return longText.length > 35 ? longText.slice(0, 32) + '...' : longText
    }

    const filteredValues = Object.values(options)
        .filter(
            (m) =>
                m.id != null &&
                m.id != itemId &&
                m.id != parentId &&
                m.deleted == false &&
                m.completed == false &&
                !m.parentId,
        )
        .map((m) => {
            console.log(marked(getItemText(m.text, m.projectId, projects)))
            // Ensure we keep markdown formatting of items
            return {
                value: m.id,
                label: (
                    <span
                        dangerouslySetInnerHTML={{
                            __html: marked(getItemText(m.text, m.projectId, projects)),
                        }}
                    />
                ),
            }
        })

    const createOptions = (
        options: OptionsType<OptionType>,
        isSubtask: boolean,
    ): { label: string; options: OptionsType<OptionType> }[] => {
        return isSubtask
            ? [
                  {
                      label: 'Options',
                      options: [{ value: '', label: 'Convert to task' }],
                  },
                  { label: 'Items', options: options },
              ]
            : [{ label: 'Items', options: options }]
    }

    return createOptions(filteredValues, parentId != null)
}

interface StateProps {
    items: Items
    projects: Projects
    theme: string
}
interface OwnProps {
    itemId: Uuid
    text: string
    parentId: Uuid | undefined
    onSubmit: (value: Uuid) => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    completed: boolean
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
                    spacing="compact"
                    type={props.style || 'default'}
                    onClick={(e) => {
                        if (props.completed) return
                        setShowSelect(!showSelect)
                        e.stopPropagation()
                    }}
                    text={
                        (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: marked(
                                        removeItemTypeFromString(
                                            props.items.items[props.parentId]?.text,
                                        ),
                                    ),
                                }}
                            />
                        ) || 'Add to item'
                    }
                    iconColour={!props.text ? themes[props.theme].colours.altIconColour : null}
                    icon={'subtask'}
                />
                {(showSelect || props.showSelect) && (
                    <Container visible={Object.keys(props.items).length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Select parent:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(
                                props.items.items,
                                props.projects,
                                props.parentId,
                                props.itemId,
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
