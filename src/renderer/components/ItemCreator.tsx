import { ReactElement, useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useMutation } from '@apollo/client'
import { Box, Button, Flex, Icon, IconButton, Tooltip, useOutsideClick } from '@chakra-ui/react'
import { CREATE_ITEM, GET_HEADER_BAR_DATA, ITEMS_BY_FILTER, ITEM_BY_KEY } from '../queries'
import { Icons } from '../assets/icons'
import EditItemCreator from './EditItemCreator'
import EditableText from './EditableText'
import { HTMLToPlainText } from '../utils'

export type ItemCreatorProps = {
  initiallyExpanded: boolean
  readOnly?: boolean
  componentKey?: string
  shouldCloseOnSubmit?: boolean
  shouldCloseOnBlur?: boolean
  parentKey?: string
  projectKey?: string | '0'
  dueAt?: Date
  scheduledAt?: Date
  repeat?: string
  labelKey?: string
  buttonText?: string
  width?: string
  hideButton?: boolean
  onCreate?: () => void
  onEscape?: () => void
  editing?: boolean
  style?: 'subtle' | 'default'
  setEditing?: (editing: boolean) => void
}

const ItemCreator = ({
  initiallyExpanded,
  readOnly,
  componentKey,
  shouldCloseOnBlur,
  shouldCloseOnSubmit,
  parentKey,
  projectKey,
  dueAt,
  scheduledAt,
  repeat,
  labelKey,
  buttonText,
  width,
  hideButton,
  onCreate,
  onEscape,
  editing,
  setEditing
}: ItemCreatorProps): ReactElement => {
  const [showItemCreator, setShowItemCreator] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick({
    ref: ref,
    handler: () => {
      setShowItemCreator(false)
    }
  })

  useEffect(() => {
    setShowItemCreator(initiallyExpanded)
  }, [initiallyExpanded])
  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY, GET_HEADER_BAR_DATA]
  })

  return (
    <>
      {editing ? (
        <EditItemCreator
          componentKey={componentKey}
          onClose={() => setEditing && setEditing(false)}
        />
      ) : (
        <Flex
          w="100%"
          alignItems="baseline"
          justifyContent="flex-end"
          p={0}
          overflowX="visible"
          my={1}
          mx={0}
          ref={ref}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowItemCreator(false)
            }
          }}
        >
          {!hideButton && (
            <Tooltip label={parentKey ? 'Create subtask' : 'Create item'}>
              <Box>
                {showItemCreator || !buttonText ? (
                  <IconButton
                    aria-label="hide"
                    size="md"
                    variant="primary"
                    icon={<Icon as={Icons.add} />}
                    color="white"
                    onClick={() => {
                      setShowItemCreator(!showItemCreator)
                    }}
                  />
                ) : (
                  <Button
                    variant="primary"
                    leftIcon={<Icon as={Icons.add} />}
                    h={9}
                    minW={9}
                    onClick={() => {
                      setShowItemCreator(!showItemCreator)
                    }}
                  >
                    {buttonText}
                  </Button>
                )}
              </Box>
            </Tooltip>
          )}
          <Flex
            position="relative"
            m={0}
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            borderRadius="md"
            width={showItemCreator ? width || '100%' : '0px'}
            opacity={showItemCreator ? '1' : 0}
            transition="width 0.2s ease-in-out 0.1s,opacity 0.2s,0.2s"
            data-cy="item-creator"
          >
            {showItemCreator && (
              <EditableText
                singleLine
                onEscape={onEscape}
                placeholder="Add an item"
                shouldClearOnSubmit
                hideToolbar={false}
                shouldSubmitOnBlur={false}
                showBorder
                onUpdate={(text) => {
                  const rawText = HTMLToPlainText(text)
                  if (!rawText.trim()) return
                  createItem({
                    variables: {
                      key: uuidv4(),
                      type: 'TODO',
                      text,
                      projectKey: projectKey ?? '0',
                      parentKey,
                      dueAt,
                      scheduledAt,
                      repeat,
                      labelKey
                    }
                  })
                }}
              />
            )}
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default ItemCreator
