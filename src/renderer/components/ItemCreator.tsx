import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Button from './Button'
import { gql, useMutation, useQuery } from '@apollo/client'
import EditItemCreator from './EditItemCreator'
import EditableText2 from './EditableText2'
import { Flex } from '@chakra-ui/react'

const CREATE_ITEM = gql`
  mutation CreateItem(
    $key: String!
    $type: String!
    $text: String!
    $parentKey: String
    $projectKey: String
    $dueAt: DateTime
    $scheduledAt: DateTime
    $repeat: String
    $labelKey: String
  ) {
    createItem(
      input: {
        key: $key
        type: $type
        text: $text
        parentKey: $parentKey
        projectKey: $projectKey
        dueAt: $dueAt
        scheduledAt: $scheduledAt
        repeat: $repeat
        labelKey: $labelKey
      }
    ) {
      key
      type
      text
      project {
        key
      }
    }
  }
`

export type ItemCreatorProps = {
  style?: 'subtle' | 'default'
  initiallyExpanded: boolean
  readOnly?: boolean
  componentKey?: string
  shouldCloseOnSubmit?: boolean
  shouldCloseOnBlur?: boolean
  parentKey?: string
  areaKey?: string
  projectKey?: string | '0'
  dueAt?: Date
  scheduledAt?: Date
  repeat?: string
  labelKey?: string
  buttonText?: string
  width?: string
  hideButton?: boolean
  backgroundColour?: string
  innerRef?: React.RefObject<HTMLInputElement>
  onCreate?: () => void
  onEscape?: () => void
  editing?: boolean
  setEditing?: (editing: boolean) => void
}

const ItemCreator = (props: ItemCreatorProps): ReactElement => {
  const [showItemCreator, setShowItemCreator] = useState(false)

  const node = useRef<HTMLDivElement>()
  const handleClick = (e): null => {
    if (node?.current?.contains(e.target)) {
      return
    } else {
      setShowItemCreator(false)
    }

    if (props.shouldCloseOnBlur) {
      setShowItemCreator(false)
    }
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  useEffect(() => {
    setShowItemCreator(props.initiallyExpanded)
  }, [props.initiallyExpanded])
  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  })

  return (
    <>
      {props.editing ? (
        <EditItemCreator
          componentKey={props.componentKey}
          onClose={() => props.setEditing(false)}
        />
      ) : (
        <Flex
          w={'100%'}
          alignItems="baseline"
          justifyContent="flex-end"
          py={0}
          px={1}
          overflowX="visible"
          m={1}
          h={'75px'}
          ref={node}
          onKeyDown={(e) => {
            if (e.key == 'Escape') {
              setShowItemCreator(false)
            }
          }}
        >
          {!props.hideButton && (
            <Button
              size="md"
              variant="primary"
              icon="add"
              iconPosition="left"
              iconColour="#FFF"
              iconSize="14px"
              text={showItemCreator ? '' : props.buttonText}
              tooltipText={props.parentKey ? 'Create subtask' : 'Create item'}
              onClick={() => {
                setShowItemCreator(!showItemCreator)
              }}
            />
          )}
          <Flex
            position="relative"
            my={0}
            mx={1}
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            borderRadius={4}
            width={showItemCreator ? (props.width ? props.width : '100%') : '0px'}
            opacity={showItemCreator ? '1' : 0}
            transition={'width 0.2s ease-in-out'}
            data-cy="item-creator"
          >
            <EditableText2
              singleLine={true}
              onEscape={props.onEscape}
              placeholder={'Add an item'}
              shouldClearOnSubmit={true}
              hideToolbar={false}
              shouldSubmitOnBlur={false}
              showBorder={true}
              onUpdate={(text) => {
                createItem({
                  variables: {
                    key: uuidv4(),
                    type: 'TODO',
                    text: text,
                    projectKey: props.projectKey,
                    parentKey: props.parentKey,
                    dueAt: props.dueAt,
                    scheduledAt: props.scheduledAt,
                    repeat: props.repeat,
                    labelKey: props.labelKey,
                  },
                })
              }}
            />
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default ItemCreator
