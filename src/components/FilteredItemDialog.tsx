import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from '../StyledComponents'
import {
    DialogContainer,
    DialogHeader,
    DialogName,
    Setting,
    SettingLabel,
    SettingValue,
    SelectContainer,
    SaveContainer,
    HelpButtonContainer,
    CloseButtonContainer,
} from './styled/FilteredItemDialog'
import { themes, selectStyles } from '../theme'
import Button from './Button'
import Switch from 'react-switch'
import EditableText from '../components/EditableText'
import { compileExpression } from 'filtrex'
import {
    setFilteredItemListName,
    setFilteredItemListFilterable,
    setFilteredItemListFilter,
    setFilteredItemListHiddenIcons,
    setFilteredItemListShowAllTasks,
} from '../actions'
import Select from 'react-select'
import { ItemIcons } from '../interfaces/item'
import { Labels, IconType } from '../interfaces'
import { Icons } from '../assets/icons'
import Tooltip from './Tooltip'
import { Code } from './Typography'
import { toast } from 'react-toastify'
import { getFilterFunctions } from '../selectors/item'

const options: { value: string; label: string }[] = [
    { value: ItemIcons.Project, label: 'Project' },
    { value: ItemIcons.Due, label: 'Due' },
    { value: ItemIcons.Scheduled, label: 'Scheduled' },
    { value: ItemIcons.Repeat, label: 'Repeat' },
    { value: ItemIcons.Subtask, label: 'Subtask' },
]

interface DispatchProps {
    setFilteredItemListName: (componentId: string, name: string) => void
    setFilteredItemListFilter: (componentId: string, filter: string) => void
    setFilteredItemListFilterable: (componentId: string, filterable: boolean) => void
    setFilteredItemListHiddenIcons: (componentId: string, hiddenIcons: IconType[]) => void
    setFilteredItemListShowAllTasks: (componentId: string, showAllTasks: boolean) => void
}

interface OwnProps {
    listName: string
    filter: string
    componentId: string
    isFilterable: boolean
    showSubtasks: boolean
    onClose: () => void
}

interface StateProps {
    theme: string
    labels: Labels
    filterFunctions: filterFunctions 
}

type FilteredItemDialogProps = OwnProps & DispatchProps & StateProps
const FilteredItemDialog = (props: FilteredItemDialogProps): ReactElement => {
    const theme = themes[props.theme]
    const node = useRef<HTMLDivElement>()
    const filterRef = useRef<HTMLInputElement>()
    const nameRef = useRef<HTMLInputElement>()

    const [errorMessage, setErrorMessage] = useState('')
    const handleClick = (e): null => {
        if (node.current?.contains(e.target)) {
            return
        }
        props.onClose()
    }
    useEffect(() => {
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [])

    return (
        <ThemeProvider theme={theme}>
            <DialogContainer ref={node}>
                <DialogHeader>
                    <HelpButtonContainer
                        data-for={'help-icon' + props.componentId}
                        data-tip
                        data-html={true}
                    >
                        {Icons.help(18, 18, themes[props.theme].colours.disabledTextColour)}
                    </HelpButtonContainer>
                    <DialogName>{'Update List'}</DialogName>

                    <CloseButtonContainer>
                        <Button
                            type="default"
                            spacing="compact"
                            icon="close"
                            onClick={() => {
                                props.onClose()
                            }}
                        />
                    </CloseButtonContainer>
                    <Tooltip
                        id={'help-icon' + props.componentId}
                        multiline={true}
                        html={true}
                        text={`
                                <h3 style="color:#e0e0e0;padding-top:10px">Options:</h3>
                                <ul>
                                <li> Name - the name displayed for the list </li>
                                <li> Filter - the query to determine the items shown (See help for syntax) </li>
                                <li> Filterable - shows or hides the filter bar </li>
                                <li> Show subtasks - will show subtasks when the parent isn't included in the list </li>
                                <li> Hide icons - select the icons to hide each item </li>
                                </ul>
                                `}
                    />
                </DialogHeader>

                <Setting>
                    <SettingLabel>Name:</SettingLabel>
                    <SettingValue>
                        <EditableText
                            innerRef={nameRef}
                            key={'ed-name'}
                            input={props.listName}
                            fontSize={'xsmall'}
                            shouldSubmitOnBlur={true}
                            onEscape={() => {}}
                            singleline={true}
                            shouldClearOnSubmit={false}
                            onUpdate={(input) => {
                                props.setFilteredItemListName(props.componentId, input)
                                return true
                            }}
                        />
                    </SettingValue>
                </Setting>
                <Setting>
                    <SettingLabel>Filter:</SettingLabel>
                    <SettingValue data-for={'filter' + props.componentId} data-tip>
                        <EditableText
                            innerRef={filterRef}
                            key={'ed-name'}
                            input={props.filter}
                            fontSize={'xsmall'}
                            shouldSubmitOnBlur={true}
                            onEscape={() => {}}
                            style={Code}
                            plainText={true}
                            validation={(input) => {
                                try {
                                    compileExpression(
                                        input,
                                       props.filterFunctions 
                                    )
                                    setErrorMessage('')
                                } catch (e) {
                                    const error = e.message.split('\n')
                                    error.shift()
                                    setErrorMessage(
                                        '   <strong>Error parsing filter:</strong></br>' +
                                            error.join('<br>'),
                                    )
                                    return false
                                }

                                return true
                            }}
                            singleline={false}
                            shouldClearOnSubmit={false}
                            onUpdate={(input) => {
                                props.setFilteredItemListFilter(props.componentId, input)
                            }}
                        />
                    </SettingValue>
                </Setting>

                <Setting>
                    <SettingLabel>Filterable:</SettingLabel>
                    <SettingValue style={{paddingTop: '7px'}}>
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
                    </SettingValue>
                </Setting>
                <Setting>
                    <SettingLabel>Show subtasks:</SettingLabel>
                    <SettingValue style={{paddingTop: '7px'}}>
                        <Switch
                            checked={props.showSubtasks}
                            onChange={(input) => {
                                props.setFilteredItemListShowAllTasks(props.componentId, input)
                            }}
                            onColor={theme.colours.primaryColour}
                            checkedIcon={false}
                            uncheckedIcon={false}
                            width={24}
                            height={14}
                        />
                    </SettingValue>
                </Setting>
                <Setting>
                    <SettingLabel>Hide Icons:</SettingLabel>
                    <SettingValue>
                        <SelectContainer>
                            <Select
                                isMulti={true}
                                onChange={(values) => {
                                    const hiddenIcons = values.map((v) => v.value)
                                    props.setFilteredItemListHiddenIcons(
                                        props.componentId,
                                        hiddenIcons,
                                    )
                                }}
                                options={options}
                                styles={selectStyles({
                                    fontSize: 'xsmall',
                                    theme: theme,
                                    width: '200px',
                                })}
                                escapeClearsValue={true}
                            />
                        </SelectContainer>
                    </SettingValue>
                </Setting>
                <SaveContainer>
                    <Button
                        width="80px"
                        type="primary"
                        icon="save"
                        text="Save"
                        onClick={() => {
                            if (errorMessage != '') {
                                toast.error(
                                    <div
                                        style={{
                                            padding: '7px 5px',
                                            color: '#FFFFFF',
                                            fontFamily: "'SFMono-Regular',Consolas, monospace",
                                        }}
                                        dangerouslySetInnerHTML={{ __html: errorMessage }}
                                    ></div>,
                                )
                            } else {
                                props.onClose()
                                toast.dark('Component updated')
                            }
                        }}
                    />
                </SaveContainer>
            </DialogContainer>
        </ThemeProvider>
        
}

const mapStateToProps = (state): StateProps => {
    return {
        theme: state.ui.theme,
        labels: state.ui.labels,
        filterFunctions: getFilterFunctions(state)
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
    setFilteredItemListHiddenIcons: (componentId: string, hiddenIcons: IconType[]) => {
        dispatch(setFilteredItemListHiddenIcons(componentId, hiddenIcons))
    },
    setFilteredItemListShowAllTasks: (componentId: string, showAllTasks: boolean) => {
        dispatch(setFilteredItemListShowAllTasks(componentId, showAllTasks))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(FilteredItemDialog)
