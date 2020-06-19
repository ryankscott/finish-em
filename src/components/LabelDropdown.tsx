import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import { themes, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'
import CSS from 'csstype'

import { connect } from 'react-redux'
import { Items, Label } from '../interfaces'
import Button from './Button'
import { Container } from './styled/LabelDropdown'
import { transparentize } from 'polished'

type OptionType = { value: string; label: string; color: CSS.Color }

const generateOptions = (labels: Label): OptionType[] => {
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

interface StateProps {
    items: Items
    labels: Label
    theme: string
}
interface OwnProps {
    labelId: Uuid
    onSubmit: (value: Uuid) => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    completed: boolean
    showSelect?: boolean
}

type LabelProps = StateProps & OwnProps
function LabelDropdown(props: LabelProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        }
        setShowSelect(false)
        return
    }
    const node = useRef()

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

    const text = props.labels[props?.labelId]?.name
    const colour = props.labels[props?.labelId]?.colour
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
                    text={text || 'Add label'}
                    iconColour={text ? colour : null}
                    icon={'label'}
                />
                {(showSelect || props.showSelect) && (
                    <Container visible={Object.keys(props.items).length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Select label:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(props.labels)}
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
    labels: state.ui.labels.labels,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): {} => ({})
export default connect(mapStateToProps, mapDispatchToProps)(LabelDropdown)
