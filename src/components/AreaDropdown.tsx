import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { OptionsType } from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { v4 as uuidv4 } from 'uuid'
import { themes, selectStyles } from '../theme'

import { connect } from 'react-redux'
import { createArea } from '../actions'
import { Area, AreaType, Area, Areas } from '../interfaces'
import { Container } from './styled/AreaDropdown'
import Button from './Button'

type OptionType = { value: string; label: JSX.Element | string }

const generateOptions = (area: AreaType, areas: Area): OptionsType => {
    const a = Object.values(areas)
    const filteredAreas = a
        .filter((a) => a.id != '0')
        .filter((a) => a.id != area?.id)
        .filter((a) => a.deleted == false)

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
    createArea: (id: string, value: string | '0') => void
}
interface StateProps {
    areas: Areas
    theme: string
}
interface OwnProps {
    onSubmit: (value: string | '0') => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    areaId: string | '0'
    completed: boolean
    deleted: boolean
    showSelect?: boolean
}

type AreaDropdownProps = DispatchProps & StateProps & OwnProps
function AreaDropdown(props: AreaDropdownProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const area = props.areas.areas?.[props.areaId]
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        } else if (actionMeta.action == 'create-option') {
            const newAreaId = uuidv4()
            props.createArea(newAreaId, newValue.value)
            props.onSubmit(newAreaId)
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
                    text={area ? area.name : 'None'}
                    isDisabled={props.deleted}
                />
                {(showSelect || props.showSelect) && (
                    <Container visible={props.areas.order.length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Area:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(area, props.areas.areas)}
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
                            }}
                        />
                    </Container>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    areas: state.areas,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createArea: (id: string, name: string) => {
        dispatch(createArea(id, name, '', '0'))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(AreaDropdown)
