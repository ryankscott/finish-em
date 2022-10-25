import { useMutation } from '@apollo/client';
import { Flex, Icon, IconButton, Tooltip, Kbd } from '@chakra-ui/react';
import CommandPalette from 'react-command-palette';
import { Icons } from 'renderer/assets/icons';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  RESTORE_ITEM,
  UNCOMPLETE_ITEM,
  ITEMS_BY_FILTER,
} from '../queries';
import { useAppStore, AppState } from 'renderer/state';

const CommandBar = () => {
  const [activeItemIds] = useAppStore((state: AppState) => [
    state.activeItemIds,
  ]);

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

  type CustomCommand = {
    id: number;
    icon: string;
    shortcut: string;
    color: string;
    name: string;
    command: () => void;
  };
  const allCommands: CustomCommand[] = [
    {
      id: 1,
      icon: '',
      shortcut: 'c',
      color: '',
      name: 'Complete item',
      command: () => {
        activeItemIds.forEach((i) => {
          completeItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 2,
      icon: '',
      shortcut: 'd',
      color: '',
      name: 'Delete item',
      command: () => {
        activeItemIds.forEach((i) => {
          deleteItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 3,
      icon: '',
      shortcut: 'u',
      color: '',
      name: 'Uncomplete item',
      command: () => {
        activeItemIds.forEach((i) => {
          unCompleteItem({ variables: { key: i } });
        });
      },
    },
    {
      id: 4,
      icon: '',
      shortcut: 'r',
      color: '',
      name: 'Restore item',
      command: () => {
        activeItemIds.forEach((i) => {
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
      resetInputOnOpen
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
        <Tooltip label="Show command bar">
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
            <span>{suggestion.name}</span>
            <Kbd color="black">{suggestion.shortcut}</Kbd>
          </Flex>
        );
      }}
      onSelect={() => {}}
    />
  );
};
export default CommandBar;
