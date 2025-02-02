import { useMutation, useQuery } from '@apollo/client'
import {
  Button,
  Box,
  Flex,
  Switch,
  Editable,
  EditableInput,
  EditablePreview,
  useColorMode,
  Icon,
  IconButton
} from '@chakra-ui/react'
import React, { ReactElement, useState } from 'react'
import {
  UPDATE_COMPONENT,
  GET_COMPONENT_BY_KEY,
  GET_COMPONENTS_BY_VIEW
} from '../queries/component'
import { Icons } from '../assets/icons'
import Select from './Select'
import { ItemIcons } from '../interfaces'
import ItemFilterBuilder from './ItemFilterBuilder'

const options: { value: string; label: string }[] = [
  { value: ItemIcons.Project, label: 'Project' },
  { value: ItemIcons.Due, label: 'Due' },
  { value: ItemIcons.Scheduled, label: 'Scheduled' },
  { value: ItemIcons.Repeat, label: 'Repeat' },
  { value: ItemIcons.Subtask, label: 'Subtask' }
]

type FilteredItemDialogProps = {
  componentKey: string
  onClose: () => void
}

const FilteredItemDialog = ({ componentKey, onClose }: FilteredItemDialogProps): ReactElement => {
  const { colorMode } = useColorMode()
  const [isValid, setIsValid] = useState(true)

  const [updateComponent] = useMutation(UPDATE_COMPONENT, {
    refetchQueries: [GET_COMPONENTS_BY_VIEW, GET_COMPONENT_BY_KEY]
  })
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: componentKey },
    fetchPolicy: 'no-cache'
  })

  if (loading) return <></>
  if (error) {
    console.log(error)
    return <></>
  }

  let params: {
    listName: string
    isFilterable: boolean
    legacyFilter: string
    filter: string
    flattenSubtasks: boolean
    hiddenIcons: string[]
    hideCompletedSubtasks: boolean
    hideDeletedSubtasks: boolean
    showCompletedToggle: boolean
    initiallyExpanded: boolean
    showSnoozedItems: boolean
  }

  try {
    params = JSON.parse(data.component.parameters)
  } catch (err) {
    console.log('Failed to parse parameters')
    console.log(err)
    return <></>
  }

  type ItemListSettingProps = {
    children: JSX.Element
    name: string
  }
  const ItemListSetting = ({ children, name }: ItemListSettingProps) => (
    <Flex
      direction="row"
      justifyContent="flex-start"
      py={1}
      px={0}
      w="100%"
      minH="35px"
      alignItems="bottom"
    >
      <Flex
        alignSelf="flex-start"
        color={colorMode === 'light' ? 'gray.800' : 'gray.100'}
        fontSize="md"
        py={1}
        px={2}
        mr={2}
        w="130px"
        minW="130px"
      >
        {name}:
      </Flex>
      <Flex
        direction="column"
        justifyContent="center"
        py={0}
        px={2}
        width="100%"
        alignItems="flex-start"
      >
        {children}
      </Flex>
    </Flex>
  )

  // TODO: Create individual update queries instead of this big one
  return (
    <Flex
      direction="column"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      py={2}
      px={4}
      pb={6}
      borderBottom="1px solid"
      borderRadius="md"
      borderColor="gray.200"
      w="100%"
    >
      <Flex direction="row" justifyContent="flex-end" py={2}>
        <IconButton
          aria-label="close"
          size="sm"
          variant="default"
          icon={<Icon as={Icons.close} />}
          onClick={() => {
            onClose()
          }}
        />
      </Flex>

      <ItemListSetting name="Name">
        <Editable
          defaultValue={params.listName}
          fontSize="md"
          w="100%"
          onChange={(input) => {
            params.listName = input
          }}
        >
          <EditablePreview />
          <EditableInput />
        </Editable>
      </ItemListSetting>

      <ItemListSetting name="Filter">
        <Flex overflowX="scroll" direction="column" w="100%" justifyContent="space-between">
          <ItemFilterBuilder
            defaultFilter={params.filter}
            onSubmit={(filter) => {
              params.filter = filter
              setIsValid(true)
            }}
          />
        </Flex>
      </ItemListSetting>

      <ItemListSetting name="Filterable">
        <Switch
          size="sm"
          defaultChecked={params.isFilterable}
          checked={params.isFilterable}
          onChange={() => {
            params.isFilterable = !params.isFilterable
          }}
        />
      </ItemListSetting>

      <ItemListSetting name="Flatten subtasks">
        <Switch
          size="sm"
          defaultChecked={params.flattenSubtasks}
          checked={params.flattenSubtasks}
          onChange={() => {
            params.flattenSubtasks = !params.flattenSubtasks
          }}
        />
      </ItemListSetting>

      <ItemListSetting name="Hide completed subtasks">
        <Switch
          size="sm"
          defaultChecked={params.hideCompletedSubtasks}
          checked={params.hideCompletedSubtasks}
          onChange={() => {
            params.hideCompletedSubtasks = !params.hideCompletedSubtasks
          }}
        />
      </ItemListSetting>

      <ItemListSetting name="Hide deleted subtasks">
        <Switch
          size="sm"
          defaultChecked={params.hideDeletedSubtasks}
          checked={params.hideDeletedSubtasks}
          onChange={() => {
            params.hideDeletedSubtasks = !params.hideDeletedSubtasks
          }}
        />
      </ItemListSetting>

      <ItemListSetting name="Show snoozed items">
        <Switch
          size="sm"
          defaultChecked={params.showSnoozedItems}
          checked={params.showSnoozedItems}
          onChange={() => {
            params.showSnoozedItems = !params.showSnoozedItems
          }}
        />
      </ItemListSetting>

      <ItemListSetting name="Hide icons">
        <Box>
          <Select
            placeholder="Select icons to hide"
            defaultValue={params.hiddenIcons?.map((i) => {
              return options.find((o) => o.value === i)
            })}
            isMulti
            onChange={(values: { value: string; label: string }[]) => {
              const hiddenIcons = values.map((v) => v.value)
              params.hiddenIcons = hiddenIcons
            }}
            options={options}
            escapeClearsValue
          />
        </Box>
      </ItemListSetting>

      <Flex
        position="relative"
        direction="row"
        justifyContent="flex-end"
        py={0}
        px={2}
        width="100%"
      >
        <Button
          size="md"
          disabled={!isValid}
          variant="primary"
          rightIcon={<Icon as={Icons.save} />}
          onClick={() => {
            updateComponent({
              variables: {
                key: componentKey,
                parameters: {
                  filter: params.filter,
                  legacyFilter: params.legacyFilter,
                  hiddenIcons: params.hiddenIcons,
                  listName: params.listName,
                  showCompletedToggle: params.showCompletedToggle,
                  initiallyExpanded: params.initiallyExpanded,
                  flattenSubtasks: params.flattenSubtasks,
                  isFilterable: params.isFilterable,
                  hideCompletedSubtasks: params.hideCompletedSubtasks,
                  hideDeletedSubtasks: params.hideDeletedSubtasks,
                  showSnoozedItems: params.showSnoozedItems
                }
              }
            })
            onClose()
          }}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  )
}

export default React.memo(FilteredItemDialog, () => true)
