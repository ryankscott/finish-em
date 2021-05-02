import { gql, useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Flex,
  Text,
  useTheme,
  Switch,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import Select from './Select'
import { ItemIcons } from '../interfaces/item'
import Button from './Button'
import Expression from './filter-box/Expression'
import ItemFilterBox from './ItemFilterBox'

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
  }
`

const UPDATE_COMPONENT = gql`
  mutation SetParametersOfComponent($key: String!, $parameters: JSON!) {
    setParametersOfComponent(input: { key: $key, parameters: $parameters }) {
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
  const [isValid, setIsValid] = useState(true)

  const [updateComponent] = useMutation(UPDATE_COMPONENT)
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  })

  if (loading) return null
  if (error) {
    console.log(error)
    return null
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
  }

  try {
    params = JSON.parse(data.component.parameters)
  } catch (error) {
    console.log('Failed to parse parameters')
    console.log(error)
    return null
  }
  const settingStyles = {
    justifyContent: 'flex-start',
    py: 1,
    px: 2,
    w: '100%',
    minH: '35px',
    alignItems: 'bottom',
  }

  const settingLabelStyles = {
    display: 'flex',
    alignSelf: 'flex-start',
    color: 'gray.800',
    fontSize: 'md',
    py: 1,
    px: 3,
    mr: 3,
    w: '160px',
    minW: '160px',
  }

  const settingValueStyles = {
    display: 'flex',
    justifyContent: 'center',
    py: 0,
    px: 2,
    width: '100%',
    alignItems: 'flex-start',
  }

  console.log('re-render')
  // TODO: Create individual update queries instead of this big one
  return (
    <Flex direction={'column'} bg={'gray.50'} py={2} px={4} pb={6} w={'100%'}>
      <Flex direction={'row'} justifyContent={'flex-end'} p={2}>
        <Box>
          <Button
            size="sm"
            variant="default"
            iconSize="14"
            icon="close"
            onClick={() => {
              props.onClose()
            }}
          />
        </Box>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Name:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Editable
            defaultValue={params.listName}
            color="gray.800"
            fontSize="md"
            w={'100%'}
            onChange={(input) => {
              params.listName = input
            }}
          >
            <EditablePreview />
            <EditableInput />
          </Editable>
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Filter:</Flex>
        <Flex overflowX={'scroll'} direction={'column'} w={'100%'} justifyContent={'space-between'}>
          {params.legacyFilter && (
            <Box my={2} mx={2}>
              <Text
                border="1px solid"
                borderRadius={5}
                bg={'gray.100'}
                borderColor={'gray.200'}
                p={1.5}
                fontFamily={'mono'}
                color="gray.800"
                fontSize="sm"
                w={'100%'}
              >
                {params.legacyFilter}
              </Text>
            </Box>
          )}
          <ItemFilterBox
            filter={params.filter ? JSON.parse(params.filter).text : ''}
            onSubmit={(query: string, filter: Expression[]) => {
              params.filter = JSON.stringify({ text: query, value: filter })
              setIsValid(true)
            }}
            onError={() => setIsValid(false)}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Filterable:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            defaultChecked={params.isFilterable}
            checked={params.isFilterable}
            onChange={() => {
              params.isFilterable = !params.isFilterable
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Flatten subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            defaultChecked={params.flattenSubtasks}
            checked={params.flattenSubtasks}
            onChange={() => {
              params.flattenSubtasks = !params.flattenSubtasks
            }}
          />
        </Flex>
      </Flex>

      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Hide completed subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            defaultChecked={params.hideCompletedSubtasks}
            checked={params.hideCompletedSubtasks}
            onChange={() => {
              params.hideCompletedSubtasks = !params.hideCompletedSubtasks
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Hide deleted subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            defaultChecked={params.hideDeletedSubtasks}
            checked={params.hideDeletedSubtasks}
            onChange={() => {
              params.hideDeletedSubtasks = !params.hideDeletedSubtasks
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Hide icons:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Box>
            <Select
              placeholder="Select icons to hide"
              size="md"
              defaultValue={params.hiddenIcons?.map((i) => {
                return options.find((o) => o.value == i)
              })}
              isMulti={true}
              onChange={(values: { value: string; label: string }[]) => {
                const hiddenIcons = values.map((v) => v.value)
                params.hiddenIcons = hiddenIcons
              }}
              options={options}
              escapeClearsValue={true}
            />
          </Box>
        </Flex>
      </Flex>
      <Flex
        position={'relative'}
        direction={'row'}
        justifyContent={'flex-end'}
        py={0}
        px={8}
        width={'100%'}
      >
        <Button
          size="md"
          text="Save"
          disabled={!isValid}
          variant={'primary'}
          icon="save"
          onClick={() => {
            updateComponent({
              variables: {
                key: props.componentKey,
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
                },
              },
            })
            props.onClose()
          }}
        />
      </Flex>
    </Flex>
  )
}

export default React.memo(FilteredItemDialog, () => true)
