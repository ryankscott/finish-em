import React, { ReactElement, useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from '@apollo/client';
import { Box, Button, Flex, Icon, IconButton, Tooltip } from '@chakra-ui/react';
import { CREATE_ITEM } from 'renderer/queries';
import { Icons } from 'renderer/assets/icons';
import EditItemCreator from './EditItemCreator';
import EditableText2 from './EditableText2';

export type ItemCreatorProps = {
  initiallyExpanded: boolean;
  readOnly?: boolean;
  componentKey?: string;
  shouldCloseOnSubmit?: boolean;
  shouldCloseOnBlur?: boolean;
  parentKey?: string;
  areaKey?: string;
  projectKey?: string | '0';
  dueAt?: Date;
  scheduledAt?: Date;
  repeat?: string;
  labelKey?: string;
  buttonText?: string;
  width?: string;
  hideButton?: boolean;
  backgroundColour?: string;
  innerRef?: React.RefObject<HTMLInputElement>;
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
  areaKey,
  projectKey,
  dueAt,
  scheduledAt,
  repeat,
  labelKey,
  buttonText,
  width,
  hideButton,
  backgroundColour,
  innerRef,
  onCreate,
  onEscape,
  editing,
  style,
  setEditing,
}: ItemCreatorProps): ReactElement => {
  const [showItemCreator, setShowItemCreator] = useState(false);

  const node = useRef<HTMLDivElement>();
  const handleClick = (e) => {
    if (node?.current?.contains(e.target)) {
      return;
    }
    setShowItemCreator(false);

    if (shouldCloseOnBlur) {
      setShowItemCreator(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  useEffect(() => {
    setShowItemCreator(initiallyExpanded);
  }, [initiallyExpanded]);
  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: ['itemsByFilter', 'itemByKey', 'getItems'],
  });
  console.log(buttonText);
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
          h="75px"
          ref={node}
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
            borderRadius={4}
            width={showItemCreator ? width || '100%' : '0px'}
            opacity={showItemCreator ? '1' : 0}
            transition="width 0.2s ease-in-out 0.1s,opacity 0.2s,0.2s"
            data-cy="item-creator"
          >
            <EditableText2
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
