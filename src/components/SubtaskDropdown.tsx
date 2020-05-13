import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import { theme, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'

import { connect } from 'react-redux'
import { Item,  Items, Projects } from '../interfaces'
import { Button } from './Button'
import { Paragraph } from './Typography'
import { removeItemTypeFromString} from '../utils'
import { subtaskIcon } from '../assets/icons'
import { DisabledContainer, Container } from './styled/SubtaskDropdown'

const generateOptions = (
    options: Item,
    projects: Projects,
    parentId: Uuid,
    itemId: Uuid
): {
    label: string
    options: {
        value: Uuid | '0'
        label: string
    }[]
}[] => {

    const getItemText = (
        text: string,
        projectId: Uuid | '0',
        projects: Projects,
    ): string => {
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
            return {
                value: m.id,
                label: getItemText(m.text, m.projectId, projects),
            }
        })

    const createOptions = (
        options: {
            value: Uuid | null
            label: string
        }[],
        isSubtask: boolean,
    ): => {
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

interface DispatchProps {}
interface StateProps {
    items: Items
    projects: Projects
}
interface OwnProps {
    itemId: Uuid
    text: string
    parentId: Uuid | undefined
    onSubmit: (value: string) => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    disableClick?: boolean
    completed: boolean
    showSelect?: boolean
}

type SubtaskProps = DispatchProps & StateProps & OwnProps
function SubtaskDropdown(props: SubtaskProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }

    // Only render if it's not just the Inbox project that exists
    return (
        <ThemeProvider theme={theme}>
            <div>
                {props.disableClick ? (
                    <DisabledContainer>
                        {subtaskIcon()}
                        <Paragraph>
                            {removeItemTypeFromString(
                                props.items.items[props.parentId]?.text,
                            )}
                        </Paragraph>
                    </DisabledContainer>
                ) : (
                    <Button
                        spacing="compact"
                        type={props.style || 'default'}
                        onClick={(e) => {
                            if (props.completed) return
                            setShowSelect(!showSelect)
                            e.stopPropagation()
                        }}
                        text={removeItemTypeFromString(
                            props.items.items[props.parentId]?.text,
                        )}
                        iconColour={
                            !props.text ? theme.colours.lightIconColour : null
                        }
                        icon={'subtask'}
                    />
                )}
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
                                props.itemId
                            )}
                            styles={selectStyles}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={true}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    setShowSelect(false)
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
})
const mapDispatchToProps = (dispatch): DispatchProps => ({})
export default connect(mapStateToProps, mapDispatchToProps)(SubtaskDropdown)
