import { useMutation, useReactiveVar } from '@apollo/client';
import { Flex, Icon, IconButton, Tooltip } from '@chakra-ui/react';
import CommandPalette from 'react-command-palette';
import { Icons } from 'renderer/assets/icons';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  RESTORE_ITEM,
  UNCOMPLETE_ITEM,
  ITEMS_BY_FILTER,
} from '../queries';
import { activeItemVar } from '../cache';

const CommandBar = () => {
  const activeItem = useReactiveVar(activeItemVar);

  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });

  const allCommands: {
    id: number;
    icon: string;
    shortcut: string;
    name: string;
    command: () => void;
  }[] = [
    {
      id: 1,
      icon: '',
      shortcut: 'c',
      name: 'Complete item',
      command: () => {
        activeItem.forEach((i) => {
          completeItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 2,
      icon: '',
      shortcut: 'd',
      name: 'Delete item',
      command: () => {
        activeItem.forEach((i) => {
          deleteItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 3,
      icon: '',
      shortcut: 'u',
      name: 'Uncomplete item',
      command: () => {
        activeItem.forEach((i) => {
          unCompleteItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 4,
      icon: '',
      shortcut: 'r',
      name: 'Restore item',
      command: () => {
        activeItem.forEach((i) => {
          restoreItem({ variables: { key: i } });
        });
      },
    },
  ];
  const commands = allCommands;

  return (
    <CommandPalette
      commands={commands}
      closeOnSelect
      resetInputOnClose
      alwaysRenderCommands
      theme={{
        container: 'command-container',
        containerOpen: 'command-containerOpen',
        content: 'command-content',
        header: 'command-header',
        input: 'command-input',
        inputFocused: 'command-inputFocused',
        inputOpen: 'command-inputOpen',
        modal: 'command-modal',
        overlay: 'command-overlay',
        spinner: 'command-spinner',
        shortcut: 'command-shortcut',
        suggestion: 'command-suggestion',
        suggestionFirst: 'command-suggestionFirst',
        suggestionHighlighted: 'command-suggestionHighlighted',
        suggestionsContainer: 'command-suggestionsContainer',
        suggestionsContainerOpen: 'command-suggestionsContainerOpen',
        suggestionsList: 'command-suggestionsList',
      }}
      trigger={
        <Tooltip label="Show commandbar">
          <IconButton
            aria-label="show command bar"
            variant="dark"
            icon={<Icon as={Icons.terminal} />}
            color="gray.100"
          />
        </Tooltip>
      }
      renderCommand={(suggestion) => {
        return (
          <Flex width="100%" justifyContent="space-between">
            {suggestion.highlight ? (
              <span
                dangerouslySetInnerHTML={{ __html: suggestion.highlight }}
              />
            ) : (
              <span>{suggestion.name}</span>
            )}
            {/*   <span className={'command-shortcut'}>{suggestion.shortcut}</span> */}
          </Flex>
        );
      }}
      onSelect={() => {}}
    />
  );
};
export default CommandBar;
