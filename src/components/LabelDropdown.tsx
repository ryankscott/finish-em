import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import CreatableSelect from 'react-select/creatable'
import { themes, selectStyles } from '../theme'
import { Uuid } from '@typed/uuid'
import CSS from 'csstype'

import { connect } from 'react-redux'
import { Items, Label } from '../interfaces'
import Button from './Button'
import { labelIcon } from '../assets/icons'
import {
    DisabledContainer,
    Container,
    DisabledText,
} from './styled/LabelDropdown'

type OptionType = { value: string; label: string; color: CSS.Color }

const generateOptions = (labels: Label): OptionType[] => {
    return Object.values(labels).map((l) => {
        return { value: l.id, label: l.name, color: l.colour }
    })
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
    disableClick?: boolean
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

    const text = props.labels[props.labelId]?.name
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div>
                {props.disableClick ? (
                    <DisabledContainer>
                        {labelIcon(12, 12, props.labels[props.labelId].colour)}
                        <DisabledText>
                            {props.labels[props.labelId].name}
                        </DisabledText>
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
                        text={text || 'Add label'}
                        iconColour={
                            text ? props.labels[props.labelId].colour : null
                        }
                        icon={'label'}
                    />
                )}
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
    labels: state.ui.labels,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): {} => ({})
export default connect(mapStateToProps, mapDispatchToProps)(LabelDropdown)
