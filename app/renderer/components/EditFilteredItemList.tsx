import { gql, useMutation, useQuery } from '@apollo/client'
import React, { ReactElement, useRef, useState } from 'react'
import Select from 'react-select'
import Switch from 'react-switch'
import { FilteredItemListPropsInput } from '../../main/generated/typescript-helpers'
import { Icons } from '../assets/icons'
import EditableText from './EditableText'
import { ThemeType } from '../interfaces'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import Button from './Button'
import Expression from './filter-box/Expression'
import ItemFilterBox from './ItemFilterBox'
import {
  CloseButtonContainer,
  DialogContainer,
  DialogHeader,
  FilterContainer,
  HelpButtonContainer,
  SelectContainer,
  Setting,
  SettingLabel,
  SettingValue,
} from './styled/EditFilteredItemList'
import Tooltip from './Tooltip'
import { Code } from './Typography'

const options: { value: string; label: string }[] = [
  { value: ItemIcons.Project, label: 'Project' },
  { value: ItemIcons.Due, label: 'Due' },
  { value: ItemIcons.Scheduled, label: 'Scheduled' },
  { value: ItemIcons.Repeat, label: 'Repeat' },
  { value: ItemIcons.Subtask, label: 'Subtask' },
]

const GET_COMPONENT_BY_KEY = gql`
  query ComponentByKey($key: String!) {
    component(key: $key) {
      key
      parameters
    }
    theme @client
  }
`

const UPDATE_COMPONENT = gql`
  mutation SetParametersOfFilteredItemListComponent(
    $key: String!
    $parameters: FilteredItemListPropsInput!
  ) {
    setParametersOfFilteredItemListComponent(input: { key: $key, parameters: $parameters }) {
      key
      parameters
    }
  }
`

type FilteredItemDialogProps = {
  componentKey: string
  onClose: () => void
}

const FilteredItemDialog = (props: FilteredItemDialogProps): ReactElement => {
  const node = useRef<HTMLDivElement>()
  const filterRef = useRef<HTMLInputElement>()
  const nameRef = useRef<HTMLInputElement>()

  const [updateComponent] = useMutation(UPDATE_COMPONENT)
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  })

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  let params: FilteredItemListPropsInput = {}
  try {
    params = JSON.parse(data.component.parameters)
  } catch (error) {
    console.log('Failed to parse parameters')
    console.log(error)
    return null
  }

  const theme: ThemeType = themes[data.theme]

  // TODO: Create individual update queries instead of this big one
  return (
    <ThemeProvider theme={theme}>
      <DialogContainer ref={node}>
        <DialogHeader>
          <HelpButtonContainer
            data-for={'help-icon' + props.componentKey}
            data-tip
            data-html={true}
          >
            {Icons['help'](18, 18, theme.colours.disabledTextColour)}
          </HelpButtonContainer>
          <CloseButtonContainer>
            <Button
              type="default"
              iconSize="14"
              icon="close"
              onClick={() => {
                props.onClose()
              }}
            />
          </CloseButtonContainer>
          <Tooltip
            id={'help-icon' + props.componentKey}
            multiline={true}
            html={true}
            text={`
                <h3 style="color:#e0e0e0;padding-top:10px">Options:</h3>
                <ul>
                <li> Name - the name displayed for the list </li>
                <li> Filter - the query to determine the items shown (See help for syntax) </li>
                <li> Filterable - shows or hides the filter bar </li>
                <li> Flatten subtasks - will show subtasks when the parent isn't included in the list </li>
                <li> Hidden icons - select the icons to hide on each item </li>
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
              input={params?.listName}
              fontSize={'xsmall'}
              shouldSubmitOnBlur={true}
              onEscape={() => {}}
              singleline={true}
              shouldClearOnSubmit={false}
              onUpdate={(input) => {
                updateComponent({
                  variables: {
                    key: props.componentKey,
                    parameters: {
                      filter: params.filter,
                      legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                      hiddenIcons: params.hiddenIcons ? params.hiddenIcons : null,
                      listName: input,
                      showCompletedToggle: params.showCompletedToggle
                        ? params.showCompletedToggle
                        : true,
                      initiallyExpanded: params.initiallyExpanded ? params.initiallyExpanded : true,
                      flattenSubtasks: params.flattenSubtasks ? params.flattenSubtasks : true,
                      isFilterable: params.isFilterable ? params.isFilterable : true,
                    },
                  },
                })
                return true
              }}
            />
          </SettingValue>
        </Setting>
        <Setting>
          <SettingLabel>Filter:</SettingLabel>
          <FilterContainer>
            {params.legacyFilter && (
              <EditableText
                innerRef={filterRef}
                key={'ed-name'}
                input={params?.legacyFilter || ''}
                fontSize={'xsmall'}
                shouldSubmitOnBlur={true}
                onEscape={() => {}}
                readOnly={true}
                style={Code}
                plainText={true}
                validation={(input) => true}
                singleline={false}
                shouldClearOnSubmit={false}
                onUpdate={(input) => {}}
              />
            )}
            <ItemFilterBox
              filter={params.filter ? JSON.parse(params.filter).text : ''}
              onSubmit={(query: string, filter: Expression[]) => {
                updateComponent({
                  variables: {
                    key: props.componentKey,
                    parameters: {
                      filter: JSON.stringify({ text: query, value: filter }),
                      legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                      hiddenIcons: params.hiddenIcons ? params.hiddenIcons : null,
                      listName: params.listName ? params.listName : 'New List',
                      showCompletedToggle: params.showCompletedToggle
                        ? params.showCompletedToggle
                        : true,
                      initiallyExpanded: params.initiallyExpanded ? params.initiallyExpanded : true,
                      flattenSubtasks: params.flattenSubtasks ? params.flattenSubtasks : true,
                      isFilterable: params.isFilterable ? params.isFilterable : true,
                    },
                  },
                })
              }}
            />
          </FilterContainer>
        </Setting>
        <Setting>
          <SettingLabel>Filterable:</SettingLabel>
          <SettingValue style={{ paddingTop: '7px' }}>
            <Switch
              checked={params.isFilterable}
              onChange={(input) => {
                updateComponent({
                  variables: {
                    key: props.componentKey,
                    parameters: {
                      filter: params.filter,
                      legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                      hiddenIcons: params.hiddenIcons ? params.hiddenIcons : null,
                      listName: params.listName ? params.listName : '',
                      showCompletedToggle: params.showCompletedToggle
                        ? params.showCompletedToggle
                        : true,
                      initiallyExpanded: params.initiallyExpanded ? params.initiallyExpanded : true,
                      flattenSubtasks: params.flattenSubtasks ? params.flattenSubtasks : true,
                      isFilterable: input,
                    },
                  },
                })
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
          <SettingLabel>Flatten subtasks:</SettingLabel>
          <SettingValue style={{ paddingTop: '7px' }}>
            <Switch
              checked={params.flattenSubtasks}
              onChange={(input) => {
                updateComponent({
                  variables: {
                    key: props.componentKey,
                    parameters: {
                      filter: params.filter,
                      legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                      hiddenIcons: params.hiddenIcons ? params.hiddenIcons : null,
                      listName: params.listName ? params.listName : '',
                      showCompletedToggle: params.showCompletedToggle
                        ? params.showCompletedToggle
                        : true,
                      initiallyExpanded: params.initiallyExpanded ? params.initiallyExpanded : true,
                      flattenSubtasks: input,
                      isFilterable: params.isFilterable ? params.isFilterable : true,
                    },
                  },
                })
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
                value={params.hiddenIcons?.map((i) => {
                  return options.find((o) => o.value == i)
                })}
                isMulti={true}
                onChange={(values: { value: string; label: string }[]) => {
                  const hiddenIcons = values.map((v) => v.value)
                  updateComponent({
                    variables: {
                      key: props.componentKey,
                      parameters: {
                        filter: params.filter,
                        legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                        hiddenIcons: hiddenIcons,
                        listName: params.listName ? params.listName : '',
                        showCompletedToggle: params.showCompletedToggle
                          ? params.showCompletedToggle
                          : true,
                        initiallyExpanded: params.initiallyExpanded
                          ? params.initiallyExpanded
                          : true,
                        flattenSubtasks: params.flattenSubtasks ? params.flattenSubtasks : true,
                        isFilterable: params.isFilterable ? params.isFilterable : true,
                      },
                    },
                  })
                }}
                options={options}
                styles={selectStyles({
                  fontSize: 'xsmall',
                  theme: theme,
                  minWidth: '120px',
                })}
                escapeClearsValue={true}
              />
            </SelectContainer>
          </SettingValue>
        </Setting>
      </DialogContainer>
    </ThemeProvider>
  )
}

export default FilteredItemDialog