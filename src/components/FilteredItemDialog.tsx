import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import {
    DialogContainer,
    DialogHeader,
    DialogName,
    Setting,
    SettingLabel,
} from './styled/FilteredItemDialog'
import { themes } from '../theme'
import Button from './Button'
import Switch from 'react-switch'
import EditableText from '../components/EditableText'
import { compileExpression } from 'filtrex'
import { filtrexOptions } from '../utils'
import {
    setFilteredItemListName,
    setFilteredItemListFilterable,
    setFilteredItemListFilter,
} from '../actions'

interface DispatchProps {
    setFilteredItemListName: (componentId: string, name: string) => void
    setFilteredItemListFilter: (componentId: string, filter: string) => void
    setFilteredItemListFilterable: (componentId: string, filterable: boolean) => void
}

interface OwnProps {
    listName: string
    filter: string
    componentId: string
    isFilterable: boolean
}

interface StateProps {
    theme: string
}

type FilteredItemDialogProps = OwnProps & DispatchProps & StateProps
const FilteredItemDialog = (props: FilteredItemDialogProps): ReactElement => {
    const theme = themes[props.theme]
    const node = useRef<HTMLDivElement>()
    const filterRef = useRef<HTMLInputElement>()
    const nameRef = useRef<HTMLInputElement>()
    const [showDialog, setShowDialog] = useState(false)
    const handleClick = (e): null => {
        if (node.current.contains(e.target)) {
            return
        }
        setShowDialog(false)
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <div ref={node}>
                <div>
                    <Button
                        height="22px"
                        width="22px"
                        iconSize="14px"
                        type={'default'}
                        spacing={'compact'}
                        onClick={() => setShowDialog(!showDialog)}
                        icon="edit"
                    />
                </div>
                {showDialog && (
                    <DialogContainer>
                        <DialogHeader>
                            <DialogName>{'Update List'}</DialogName>
                            <Button
                                type="subtle"
                                spacing="compact"
                                icon="close"
                                onClick={() => {
                                    setShowDialog(false)
                                }}
                            />
                        </DialogHeader>

                        <Setting>
                            <SettingLabel>Name:</SettingLabel>
                            <EditableText
                                innerRef={nameRef}
                                key={'ed-name'}
                                input={props.listName}
                                fontSize={'xsmall'}
                                shouldSubmitOnBlur={true}
                                onEscape={() => {}}
                                validation={false}
                                singleline={true}
                                shouldClearOnSubmit={false}
                                onUpdate={(input) => {
                                    props.setFilteredItemListName(props.componentId, input)
                                }}
                            />
                        </Setting>
                        <Setting>
                            <SettingLabel>Filter:</SettingLabel>
                            <EditableText
                                innerRef={filterRef}
                                key={'ed-name'}
                                input={props.filter}
                                fontSize={'xsmall'}
                                shouldSubmitOnBlur={true}
                                onEscape={() => {}}
                                validation={{
                                    validate: true,
                                    rule: (input) => {
                                        try {
                                            compileExpression(input, filtrexOptions)
                                        } catch (e) {
                                            return false
                                        }
                                        return true
                                    },
                                }}
                                singleline={false}
                                shouldClearOnSubmit={false}
                                onUpdate={(input) => {
                                    props.setFilteredItemListFilter(props.componentId, input)
                                }}
                            />
                        </Setting>
                        <Setting>
                            <SettingLabel>Filterable:</SettingLabel>
                            <Switch
                                checked={props.isFilterable}
                                onChange={(input) =>
                                    props.setFilteredItemListFilterable(props.componentId, input)
                                }
                                onColor={theme.colours.primaryColour}
                                checkedIcon={false}
                                uncheckedIcon={false}
                                width={24}
                                height={14}
                            />
                        </Setting>
                    </DialogContainer>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => {
    return {
        theme: state.ui.theme,
    }
}

const mapDispatchToProps = (dispatch): DispatchProps => ({
    setFilteredItemListName: (componentId: string, name: string) => {
        dispatch(setFilteredItemListName(componentId, name))
    },
    setFilteredItemListFilter: (componentId: string, filter: string) => {
        dispatch(setFilteredItemListFilter(componentId, filter))
    },
    setFilteredItemListFilterable: (componentId: string, filterable: boolean) => {
        dispatch(setFilteredItemListFilterable(componentId, filterable))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemDialog)