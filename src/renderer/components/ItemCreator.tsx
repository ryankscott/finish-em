import { ReactElement, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Tooltip,
  useOutsideClick,
} from '@chakra-ui/react';
import {
  CREATE_ITEM,
  GET_HEADER_BAR_DATA,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
} from 'renderer/queries';
import { Icons } from 'renderer/assets/icons';
import EditItemCreator from './EditItemCreator';
import EditableText from './EditableText';

export type ItemCreatorProps = {
  initiallyExpanded: boolean;
  readOnly?: boolean;
  componentKey?: string;
  shouldCloseOnSubmit?: boolean;
  shouldCloseOnBlur?: boolean;
  parentKey?: string;
  projectKey?: string | '0';
  dueAt?: Date;
  scheduledAt?: Date;
  repeat?: string;
  labelKey?: string;
  buttonText?: string;
  width?: string;
  hideButton?: boolean;
  onCreate?: () => void;
  onEscape?: () => void;
  editing?: boolean;
  style?: 'subtle' | 'default';
  setEditing?: (editing: boolean) => void;
};

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
  setEditing,
}: ItemCreatorProps): ReactElement => {
  const [showItemCreator, setShowItemCreator] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: ref,
    handler: () => {
      setShowItemCreator(false);
    },
  });

  useEffect(() => {
    setShowItemCreator(initiallyExpanded);
  }, [initiallyExpanded]);
  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY, GET_HEADER_BAR_DATA],
  });

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
          py={0}
          px={1}
          overflowX="visible"
          m={1}
          ref={ref}
          h="75px"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowItemCreator(false);
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
                    color="#FFF"
                    onClick={() => {
                      setShowItemCreator(!showItemCreator);
                    }}
                  />
                ) : (
                  <Button
                    size="md"
                    variant="primary"
                    leftIcon={<Icon as={Icons.add} />}
                    color="#FFF"
                    onClick={() => {
                      setShowItemCreator(!showItemCreator);
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
            my={0}
            mx={1}
            direction="column"
            justifyContent="flex-start"
            alignItems="center"
            borderRadius="md"
            width={showItemCreator ? width || '100%' : '0px'}
            opacity={showItemCreator ? '1' : 0}
            transition="width 0.2s ease-in-out 0.1s,opacity 0.2s,0.2s"
            data-cy="item-creator"
          >
            <EditableText
              singleLine
              onEscape={onEscape}
              placeholder="Add an item"
              shouldClearOnSubmit
              hideToolbar={false}
              shouldSubmitOnBlur={false}
              showBorder
              onUpdate={(text) => {
                createItem({
                  variables: {
                    key: uuidv4(),
                    type: 'TODO',
                    text,
                    projectKey,
                    parentKey,
                    dueAt,
                    scheduledAt,
                    repeat,
                    labelKey,
                  },
                });
              }}
            />
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default ItemCreator;
