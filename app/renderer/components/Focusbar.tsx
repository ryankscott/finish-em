import { gql, useMutation, useQuery } from '@apollo/client'
import { parseISO } from 'date-fns'
import React, { ReactElement } from 'react'
import RRule from 'rrule'
import { activeItemVar, focusbarVisibleVar } from '..'
import { Item as ItemType, Label } from '../../main/generated/typescript-helpers'
import { ItemIcons } from '../interfaces/item'
import { formatRelativeDate, removeItemTypeFromString } from '../utils'
import AttributeSelect from './AttributeSelect'
import Button from './Button'
import DatePicker from './DatePicker'
import EditableText from './EditableText'
import EditableText2 from './EditableText2'
import Item from './Item'
import ItemCreator from './ItemCreator'
import RepeatPicker from './RepeatPicker'
import Tooltip from './Tooltip'
import { Header1 } from './Typography'
import { Grid, Box, GridItem, Flex, Text, VStack } from '@chakra-ui/react'
import { Icons } from '../assets/icons'

const GET_ACTIVE_ITEM = gql`
  query {
    activeItem @client
  }
`

const GET_DATA = gql`
  query itemByKey($key: String!) {
    item: item(key: $key) {
      key
      type
      text
      deleted
      completed
      dueAt
      scheduledAt
      lastUpdatedAt
      completedAt
      createdAt
      deletedAt
      repeat
      area {
        key
        name
      }
      reminders {
        remindAt
      }
      label {
        key
        name
        colour
      }
      project {
        key
        name
      }
      parent {
        key
        text
      }
      children {
        key
      }
    }
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
    theme @client
    focusbarVisible @client
  }
`

const RENAME_ITEM = gql`
  mutation RenameItem($key: String!, $text: String!) {
    renameItem(input: { key: $key, text: $text }) {
      key
      text
    }
  }
`

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`
const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
      deletedAt
      children {
        key
        deleted
        deletedAt
      }
    }
  }
`
const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
      deletedAt
    }
  }
`

const SET_PROJECT = gql`
  mutation SetProjectOfItem($key: String!, $projectKey: String) {
    setProjectOfItem(input: { key: $key, projectKey: $projectKey }) {
      key
      project {
        key
      }
    }
  }
`

const SET_AREA = gql`
  mutation SetAreaOfItem($key: String!, $areaKey: String!) {
    setAreaOfItem(input: { key: $key, areaKey: $areaKey }) {
      key
      area {
        key
        name
      }
    }
  }
`

const SET_SCHEDULED_AT = gql`
  mutation SetScheduledAtOfItem($key: String!, $scheduledAt: DateTime) {
    setScheduledAtOfItem(input: { key: $key, scheduledAt: $scheduledAt }) {
      key
      scheduledAt
    }
  }
`
const SET_DUE_AT = gql`
  mutation SetDueAtOfItem($key: String!, $dueAt: DateTime) {
    setDueAtOfItem(input: { key: $key, dueAt: $dueAt }) {
      key
      dueAt
    }
  }
`
const SET_REPEAT = gql`
  mutation SetRepeatOfItem($key: String!, $repeat: String) {
    setRepeatOfItem(input: { key: $key, repeat: $repeat }) {
      key
      repeat
      dueAt
    }
  }
`
const SET_PARENT = gql`
  mutation SetParentOfItem($key: String!, $parentKey: String) {
    setParentOfItem(input: { key: $key, parentKey: $parentKey }) {
      key
      parent {
        key
      }
    }
  }
`
const SET_LABEL = gql`
  mutation SetLabelOfItem($key: String!, $labelKey: String) {
    setLabelOfItem(input: { key: $key, labelKey: $labelKey }) {
      key
      label {
        key
      }
    }
  }
`

interface DispatchProps {}
interface StateProps {}

type FocusbarProps = DispatchProps & StateProps
const Focusbar = (props: FocusbarProps): ReactElement => {
  const ref = React.useRef<HTMLInputElement>()
  const { loading: activeLoading, error: activeError, data: activeData } = useQuery(GET_ACTIVE_ITEM)
  if (activeLoading) {
    return null
  }
  if (activeError) {
    console.log(activeError)
    return null
  }
  const { loading, error, data, refetch } = useQuery(GET_DATA, {
    variables: {
      key: activeData.activeItem.length ? activeData.activeItem[0] : '',
    },
  })

  const [renameItem] = useMutation(RENAME_ITEM, { refetchQueries: ['itemByKey'] })
  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter', 'itemByKey'],
  })
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter', 'itemByKey'],
  })
  const [setProject] = useMutation(SET_PROJECT, { refetchQueries: ['itemsByFilter'] })
  const [setArea] = useMutation(SET_AREA, { refetchQueries: ['itemsByFilter'] })
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: ['itemsByFilter', 'weeklyItems'],
  })
  const [setDueAt] = useMutation(SET_DUE_AT, { refetchQueries: ['itemsByFilter'] })
  const [setRepeat] = useMutation(SET_REPEAT, { refetchQueries: ['itemsByFilter'] })
  const [setParent] = useMutation(SET_PARENT, { refetchQueries: ['itemsByFilter'] })
  const [setLabel] = useMutation(SET_LABEL, { refetchQueries: ['itemsByFilter'] })
  const [deleteItem] = useMutation(DELETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [restoreItem] = useMutation(RESTORE_ITEM, { refetchQueries: ['itemsByFilter'] })

  if (error) {
    console.log(error)
    return null
  }

  const item: ItemType = data?.item
  if (!item) return null

  const attributeContainerStyles = {
    justifyContent: 'space-between',
    width: '100%',
    minW: '180px',
    px: 4,
  }

  const attributeValueStyles = {
    minW: '100px',
    alignItems: 'center',
  }

  // TODO: Do I need these? Or can I move to the component
  const dueDate = item?.dueAt ? formatRelativeDate(parseISO(item?.dueAt)) : 'Add due date'
  const scheduledDate = item?.scheduledAt
    ? formatRelativeDate(parseISO(item?.scheduledAt))
    : 'Add scheduled date'

  return (
    <VStack
      border={'1px solid'}
      borderColor={'gray.200'}
      shadow={'md'}
      width={data.focusbarVisible ? '100%' : 0}
      maxWidth={'350px'}
      opacity={data.focusbarVisible ? 1 : 0}
      px={3}
      py={3}
      h={'100%'}
      bg={'gray.50'}
      transition={'all 0.2s ease-in-out'}
    >
      <Grid templateColumns={'repeat(5, 1fr)'} width={'100%'} m={0} p={0}>
        {item?.parent != null && (
          <GridItem colSpan={1}>
            <Button
              variant="default"
              size="sm"
              tooltipText={'Up level'}
              onClick={() => {
                activeItemVar([item.parent.key])
              }}
              icon={'upLevel'}
            ></Button>
          </GridItem>
        )}
        <GridItem colStart={5} colSpan={1}>
          <Flex justifyContent={'flex-end'}>
            <Button
              variant="default"
              size="sm"
              onClick={() => focusbarVisibleVar(false)}
              icon={'close'}
            />
          </Flex>
        </GridItem>
      </Grid>
      <Flex alignItems={'baseline'} w={'100%'} direction="row" m={0} px={2} py={4}>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            if (item.type == 'TODO') {
              item.completed
                ? unCompleteItem({ variables: { key: item.key } })
                : completeItem({ variables: { key: item.key } })
            }
          }}
          icon={item.type == 'NOTE' ? 'note' : item.completed ? 'todoChecked' : 'todoUnchecked'}
        />
        <Box w={'100%'}>
          {data.newEditor.enabled ? (
            <EditableText2
              key={item.key}
              height={'45px'}
              width={'260px'}
              input={item.text}
              singleLine={true}
              shouldClearOnSubmit={false}
              shouldSubmitOnBlur={true}
              hideToolbar={false}
              hideBorder={true}
              onUpdate={(text) => {
                renameItem({ variables: { key: item.key, text: text } })
              }}
            />
          ) : (
            <EditableText
              key={item.key}
              innerRef={ref}
              style={Header1}
              input={removeItemTypeFromString(item.text)}
              singleline={true}
              onUpdate={(text) => {
                renameItem({ variables: { key: item.key, text: text } })
              }}
              shouldSubmitOnBlur={true}
              shouldClearOnSubmit={false}
            />
          )}
        </Box>
        {item.deleted ? (
          <>
            <Button
              variant="default"
              icon="restore"
              size="sm"
              tooltipText="Restore"
              onClick={() => {
                restoreItem({ variables: { key: item.key } })
              }}
            ></Button>
          </>
        ) : (
          <>
            <Button
              variant="default"
              icon="trash"
              size="sm"
              tooltipText="Delete"
              onClick={() => {
                deleteItem({ variables: { key: item.key } })
              }}
            ></Button>
          </>
        )}
      </Flex>
      {item.project?.key == '0' && (
        <Flex {...attributeContainerStyles}>
          <Flex {...attributeValueStyles}>
            {Icons['area']()}
            <Text fontSize="md" pl={1}>
              Area:{' '}
            </Text>
          </Flex>
          <AttributeSelect
            attribute="area"
            currentAttribute={item.area}
            completed={item.completed}
            deleted={item.deleted}
            onSubmit={(areaKey) => setArea({ variables: { key: item.key, areaKey: areaKey } })}
          />
        </Flex>
      )}
      <Flex {...attributeContainerStyles}>
        <Flex {...attributeValueStyles}>
          {Icons['project']()}
          <Text fontSize="md" pl={1}>
            Project:{' '}
          </Text>
        </Flex>
        <AttributeSelect
          attribute={'project'}
          currentAttribute={item.project}
          deleted={item.deleted}
          completed={item.completed}
          onSubmit={(projectKey) => {
            setProject({
              variables: {
                key: item.key,
                projectKey: projectKey,
              },
            })
          }}
        />
      </Flex>

      {item.type == 'TODO' && (
        <>
          <Flex {...attributeContainerStyles}>
            <Flex {...attributeValueStyles}>
              {Icons['scheduled']()}
              <Text fontSize="md" pl={1}>
                Scheduled:
              </Text>
            </Flex>
            <DatePicker
              key={'sd' + item.key}
              defaultText={'Scheduled at: '}
              onSubmit={(d: Date) => {
                setScheduledAt({ variables: { key: item.key, scheduledAt: d } })
              }}
              text={scheduledDate}
              completed={item.completed}
              deleted={item.deleted}
            />
          </Flex>
          <Flex {...attributeContainerStyles}>
            <Flex {...attributeValueStyles}>
              {Icons['due']()}
              <Text fontSize="md" pl={1}>
                Due:{' '}
              </Text>
            </Flex>
            <DatePicker
              key={'dd' + item.key}
              defaultText={'Due at: '}
              onSubmit={(d: Date) => setDueAt({ variables: { key: item.key, dueAt: d } })}
              text={dueDate}
              completed={item.completed}
              deleted={item.deleted}
            />
          </Flex>
          <Flex {...attributeContainerStyles}>
            <Flex {...attributeValueStyles}>
              {Icons['repeat']()}
              <Text fontSize="md" pl={1}>
                Repeating:{' '}
              </Text>
            </Flex>
            <RepeatPicker
              repeat={
                item.repeat && item.repeat != 'undefined' ? RRule.fromString(item.repeat) : null
              }
              completed={item.completed}
              deleted={item.deleted}
              key={'rp' + item.key}
              onSubmit={(r: RRule) =>
                setRepeat({ variables: { key: item.key, repeat: r?.toString() } })
              }
            />
          </Flex>
        </>
      )}
      {item.children.length == 0 && (
        <Flex {...attributeContainerStyles}>
          <Flex {...attributeValueStyles}>
            {Icons['subtask']()}
            <Text fontSize="md" pl={1}>
              Parent:{' '}
            </Text>
          </Flex>
          <AttributeSelect
            attribute={'item'}
            currentAttribute={item}
            completed={item.completed}
            deleted={item.deleted}
            onSubmit={(itemKey: string) =>
              setParent({ variables: { key: item.key, parentKey: itemKey } })
            }
          />
        </Flex>
      )}
      <Flex {...attributeContainerStyles}>
        <Flex {...attributeValueStyles}>
          {Icons['label']()}
          <Text fontSize="md" pl={1}>
            Label:{' '}
          </Text>
        </Flex>
        <AttributeSelect
          attribute={'label'}
          currentAttribute={item.label}
          completed={item.completed}
          deleted={item.deleted}
          onSubmit={(label) => {
            setLabel({ variables: { key: item.key, labelKey: label.value } })
          }}
        />
      </Flex>
      {item.deleted && (
        <Flex {...attributeContainerStyles}>
          <Flex {...attributeValueStyles}>
            {Icons['trash']()}
            <Text fontSize="md" pl={1}>
              Deleted at:{' '}
            </Text>
          </Flex>
          <div style={{ margin: '2px', padding: '5px 8px' }}>
            {formatRelativeDate(parseISO(item?.deletedAt))}
          </div>
        </Flex>
      )}
      {item.completed && (
        <Flex {...attributeContainerStyles}>
          <Flex {...attributeValueStyles}>
            {Icons['todoChecked']()}
            <Text fontSize="md" pl={1}>
              Completed at:{' '}
            </Text>
          </Flex>
          <div style={{ margin: '2px', padding: '5px 8px' }}>
            {formatRelativeDate(parseISO(item?.completedAt))}
          </div>
        </Flex>
      )}
      {item.parent?.key == null && item.type == 'TODO' && (
        <>
          <Text fontSize="md" w="100%" mx={0} px={2} pt={6} pb={0}>
            Subtasks:
          </Text>
          <Tooltip id="add-subtask" text="Add subtask"></Tooltip>

          {item.children.length ? (
            <Box py={0} px={2} w={'100%'} key={`box-${item.key}`}>
              {item.children?.map((childItem) => {
                return (
                  <Item
                    compact={false}
                    key={childItem.key}
                    componentKey={null}
                    itemKey={childItem.key}
                    shouldIndent={false}
                    alwaysVisible={true}
                    hiddenIcons={[ItemIcons.Project, ItemIcons.Subtask]}
                  />
                )
              })}
            </Box>
          ) : (
            <Text fontSize="md" pl={1}>
              {' '}
              No subtasks{' '}
            </Text>
          )}
          <ItemCreator key={`${item.key}-subtask`} parentKey={item.key} initiallyExpanded={false} />
        </>
      )}
    </VStack>
  )
}

export default Focusbar
