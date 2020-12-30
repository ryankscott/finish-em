import { gql, useMutation, useQuery } from '@apollo/client'
import { parseISO } from 'date-fns'
import React, { ReactElement } from 'react'
import RRule from 'rrule'
import { activeItemVar, focusbarVisibleVar } from '..'
import { Item as ItemType, Label } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ItemIcons } from '../interfaces/item'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { formatRelativeDate, removeItemTypeFromString } from '../utils'
import AreaSelect from './AreaSelect'
import Button from './Button'
import DatePicker from './DatePicker'
import EditableText from './EditableText'
import Item from './Item'
import ItemCreator from './ItemCreator'
import ItemSelect from './ItemSelect'
import LabelSelect from './LabelSelect'
import ProjectSelect from './ProjectSelect'
import RepeatPicker from './RepeatPicker'
import {
  AttributeContainer,
  AttributeKey,
  AttributeValue,
  Container,
  HeaderContainer,
  SubtaskContainer,
  TitleContainer,
} from './styled/Focusbar'
import Tooltip from './Tooltip'
import { Header1, Header3, Paragraph } from './Typography'

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
      sortOrder {
        sortOrder
      }
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
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      key: activeData.activeItem,
    },
  })

  const [renameItem] = useMutation(RENAME_ITEM)
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM)
  const [setProject] = useMutation(SET_PROJECT)
  const [setArea] = useMutation(SET_AREA)
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT)
  const [setDueAt] = useMutation(SET_DUE_AT)
  const [setRepeat] = useMutation(SET_REPEAT)
  const [setParent] = useMutation(SET_PARENT)
  const [setLabel] = useMutation(SET_LABEL)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [restoreItem] = useMutation(RESTORE_ITEM)

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const theme: ThemeType = themes[data.theme]
  const item: ItemType = data.item
  if (!item) return null

  // TODO: Do I need these? Or can I move to the component
  const dueDate = item?.dueAt ? formatRelativeDate(parseISO(item?.dueAt)) : 'Add due date'
  const scheduledDate = item?.scheduledAt
    ? formatRelativeDate(parseISO(item?.scheduledAt))
    : 'Add scheduled date'

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderContainer visible={data.focusbarVisible}>
          {item?.parent != null && (
            <div style={{ gridArea: 'UP' }}>
              <Button
                type="default"
                spacing="compact"
                tooltipText={'Up level'}
                onClick={() => {
                  activeItemVar(item.parent.key)
                }}
                icon={'upLevel'}
              ></Button>
            </div>
          )}
          <div
            style={{
              gridArea: 'CLOSE',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              type="default"
              spacing="compact"
              onClick={() => focusbarVisibleVar(false)}
              icon={'close'}
            />
          </div>
        </HeaderContainer>
        <TitleContainer>
          <Button
            type={'default'}
            spacing="compact"
            height="26px"
            width="26px"
            onClick={() => {
              if (item.type == 'TODO') {
                item.completed
                  ? unCompleteItem({ variables: { key: item.key } })
                  : completeItem({ variables: { key: item.key } })
              }
            }}
            icon={item.type == 'NOTE' ? 'note' : item.completed ? 'todoChecked' : 'todoUnchecked'}
          />
          <EditableText
            key={item.key}
            innerRef={ref}
            style={Header1}
            input={removeItemTypeFromString(item.text)}
            singleline={true}
            onUpdate={(text) => {
              renameItem({ variables: { key: item.key, text: item.type.concat(' ', text) } })
            }}
            shouldSubmitOnBlur={true}
            shouldClearOnSubmit={false}
          />
          {item.deleted ? (
            <>
              <Button
                type={'default'}
                icon="restore"
                height="26px"
                width="26px"
                spacing="compact"
                tooltipText="Restore"
                onClick={() => {
                  restoreItem({ variables: { key: item.key } })
                }}
              ></Button>
            </>
          ) : (
            <>
              <Button
                type={'default'}
                icon="trash"
                spacing="compact"
                height="26px"
                width="26px"
                tooltipText="Delete"
                onClick={() => {
                  deleteItem({ variables: { key: item.key } })
                }}
              ></Button>
            </>
          )}
        </TitleContainer>
        {item.project?.key == '0' && (
          <AttributeContainer>
            <AttributeKey>
              <Paragraph>Area: </Paragraph>
            </AttributeKey>
            <AttributeValue>
              <AreaSelect
                area={item.area}
                completed={item.deleted}
                deleted={item.deleted}
                onSubmit={(areaKey) => setArea({ variables: { key: item.key, areaKey: areaKey } })}
              />
            </AttributeValue>
          </AttributeContainer>
        )}
        <AttributeContainer>
          <AttributeKey>
            <Paragraph>Project: </Paragraph>
          </AttributeKey>
          <AttributeValue>
            <ProjectSelect
              deleted={item.deleted}
              completed={item.completed}
              project={item.project}
              onSubmit={(projectKey) => {
                setProject({
                  variables: {
                    key: item.key,
                    projectKey: projectKey,
                  },
                })
              }}
            />
          </AttributeValue>
        </AttributeContainer>

        {item.type == 'TODO' && (
          <>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Scheduled: </Paragraph>
              </AttributeKey>
              <AttributeValue>
                <DatePicker
                  key={'sd' + item.key}
                  searchPlaceholder={'Scheduled at: '}
                  onSubmit={(d: string) => {
                    setScheduledAt({ variables: { key: item.key, scheduledAt: d } })
                  }}
                  icon="scheduled"
                  text={scheduledDate}
                  completed={item.completed}
                  deleted={item.deleted}
                />
              </AttributeValue>
            </AttributeContainer>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Due: </Paragraph>
              </AttributeKey>
              <AttributeValue>
                <DatePicker
                  key={'dd' + item.key}
                  searchPlaceholder={'Due at: '}
                  onSubmit={(d: string) => setDueAt({ variables: { key: item.key, dueAt: d } })}
                  icon="due"
                  text={dueDate}
                  completed={item.completed}
                  deleted={item.deleted}
                />
              </AttributeValue>
            </AttributeContainer>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Repeating: </Paragraph>
              </AttributeKey>
              <AttributeValue>
                <RepeatPicker
                  repeat={
                    item.repeat && item.repeat != 'undefined' ? RRule.fromString(item.repeat) : null
                  }
                  completed={item.completed}
                  deleted={item.deleted}
                  key={'rp' + item.key}
                  searchPlaceholder={'Repeat: '}
                  onSubmit={(r: RRule) =>
                    setRepeat({ variables: { key: item.key, repeat: r?.toString() } })
                  }
                />
              </AttributeValue>
            </AttributeContainer>
          </>
        )}
        {item.children.length == 0 && (
          <AttributeContainer>
            <AttributeKey>
              <Paragraph>Parent:</Paragraph>
            </AttributeKey>
            <AttributeValue>
              <ItemSelect
                completed={item.completed}
                deleted={item.deleted}
                item={item}
                onSubmit={(itemKey: string) =>
                  setParent({ variables: { key: item.key, parentKey: itemKey } })
                }
              />
            </AttributeValue>
          </AttributeContainer>
        )}
        <AttributeContainer>
          <AttributeKey>
            <Paragraph>Label:</Paragraph>
          </AttributeKey>
          <AttributeValue>
            <LabelSelect
              label={item.label}
              completed={item.completed}
              deleted={item.deleted}
              onSubmit={(labelKey: string) =>
                setLabel({ variables: { key: item.key, labelKey: labelKey } })
              }
            />
          </AttributeValue>
        </AttributeContainer>
        {item.deleted && (
          <AttributeContainer>
            <AttributeKey>
              <Paragraph>Deleted date: </Paragraph>
            </AttributeKey>
            <AttributeValue>
              <div style={{ margin: '2px', padding: '5px 8px' }}>
                {formatRelativeDate(parseISO(item?.deletedAt))}
              </div>
            </AttributeValue>
          </AttributeContainer>
        )}
        {item.completed && (
          <AttributeContainer>
            <AttributeKey>
              <Paragraph>Completed date: </Paragraph>
            </AttributeKey>
            <AttributeValue>
              <div style={{ margin: '2px', padding: '5px 8px' }}>
                {formatRelativeDate(parseISO(item?.completedAt))}
              </div>
            </AttributeValue>
          </AttributeContainer>
        )}
        {item.parent?.key == null && item.type == 'TODO' && (
          <>
            <SubtaskContainer>
              <Header3>Subtasks: </Header3>
              <ItemCreator type="subtask" parentKey={item.key} initiallyExpanded={false} />
            </SubtaskContainer>
            <Tooltip id="add-subtask" text="Add subtask"></Tooltip>
          </>
        )}
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
      </Container>
    </ThemeProvider>
  )
}

export default Focusbar
