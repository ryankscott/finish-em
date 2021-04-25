import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, useTheme, Switch } from '@chakra-ui/react'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import Select from './Select'
import { ItemIcons } from '../interfaces/item'
import Button from './Button'
import EditableText from './EditableText'
import Expression from './filter-box/Expression'
import ItemFilterBox from './ItemFilterBox'
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
  const theme = useTheme()
  const node = useRef<HTMLDivElement>()
  const filterRef = useRef<HTMLInputElement>()
  const nameRef = useRef<HTMLInputElement>()
  const [isValid, setIsValid] = useState(true)
  const [listName, setListName] = useState('')
  const [isFilterable, setIsFilterable] = useState(true)
  const [filter, setFilter] = useState('')
  const [flattenSubtasks, setFlattenSubtasks] = useState(true)
  const [hideCompletedSubtasks, setHideCompletedSubtasks] = useState(false)
  const [hideDeletedSubtasks, setHideDeletedSubtasks] = useState(false)
  const [hiddenIcons, setHiddenIcons] = useState([])

  const [updateComponent] = useMutation(UPDATE_COMPONENT)
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  })
  useEffect(() => {
    if (loading === false && data) {
      setListName(params.listName)
      setIsFilterable(params.isFilterable)
      setFilter(params.filter)
      setFlattenSubtasks(params.flattenSubtasks)
      setHiddenIcons(params.hiddenIcons)
      setHideCompletedSubtasks(params?.hideCompletedSubtasks ? params.hideCompletedSubtasks : false)
      setHideDeletedSubtasks(params?.hideDeletedSubtasks ? params.hideCompletedSubtasks : false)
    }
  }, [loading, data])

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  let params = {}
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

  // TODO: Create individual update queries instead of this big one
  return (
    <Flex direction={'column'} bg={'gray.50'} py={2} px={4} pb={6} w={'100%'} ref={node}>
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
          <EditableText
            innerRef={nameRef}
            key={'ed-name'}
            input={listName}
            fontSize={'xsmall'}
            shouldSubmitOnBlur={true}
            onEscape={() => {}}
            singleline={true}
            shouldClearOnSubmit={false}
            onUpdate={(input) => {
              setListName(input)
              return true
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Filter:</Flex>
        <Flex overflowX={'scroll'} direction={'column'} w={'100%'} justifyContent={'space-between'}>
          {params.legacyFilter && (
            <Box my={2} mx={2}>
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
            </Box>
          )}
          <ItemFilterBox
            filter={filter ? JSON.parse(filter).text : ''}
            onSubmit={(query: string, filter: Expression[]) => {
              setFilter(JSON.stringify({ text: query, value: filter }))
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
            checked={isFilterable}
            onChange={() => {
              setIsFilterable(!isFilterable)
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Flatten subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            checked={flattenSubtasks}
            onChange={() => {
              setFlattenSubtasks(!flattenSubtasks)
            }}
          />
        </Flex>
      </Flex>

      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Hide completed subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            checked={hideCompletedSubtasks}
            onChange={(input) => {
              setFlattenSubtasks(!hideCompletedSubtasks)
            }}
          />
        </Flex>
      </Flex>
      <Flex direction={'row'} {...settingStyles}>
        <Flex {...settingLabelStyles}>Hide deleted subtasks:</Flex>
        <Flex direction={'column'} {...settingValueStyles}>
          <Switch
            size="sm"
            checked={hideDeletedSubtasks}
            onChange={(input) => {
              setFlattenSubtasks(!hideDeletedSubtasks)
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
              defaultValue={hiddenIcons?.map((i) => {
                return options.find((o) => o.value == i)
              })}
              isMulti={true}
              onChange={(values: { value: string; label: string }[]) => {
                console.log(values)
                const hiddenIcons = values.map((v) => v.value)
                setHiddenIcons(hiddenIcons)
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
                  filter: filter,
                  legacyFilter: params.legacyFilter ? params.legacyFilter : null,
                  hiddenIcons: hiddenIcons ? hiddenIcons : null,
                  listName: listName,
                  showCompletedToggle: params.showCompletedToggle
                    ? params.showCompletedToggle
                    : true,
                  initiallyExpanded: params.initiallyExpanded ? params.initiallyExpanded : true,
                  flattenSubtasks: flattenSubtasks ? flattenSubtasks : true,
                  isFilterable: isFilterable ? isFilterable : true,
                  hideCompletedSubtasks: hideCompletedSubtasks ? hideCompletedSubtasks : false,
                  hideDeletedSubtasks: hideDeletedSubtasks ? hideDeletedSubtasks : false,
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

export default FilteredItemDialog
