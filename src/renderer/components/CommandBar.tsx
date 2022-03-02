import { useMutation, useReactiveVar } from '@apollo/client';
import { Flex, useTheme, IconButton, Tooltip } from '@chakra-ui/react';
import CommandPalette from 'react-command-palette';
import { activeItemVar } from 'renderer';
import { convertSVGElementToReact, Icons } from 'renderer/assets/icons';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  RESTORE_ITEM,
  UNCOMPLETE_ITEM,
} from 'renderer/queries';

export const CommandBar = () => {
  const theme = useTheme();
  const activeItem = useReactiveVar(activeItemVar);

  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: ['itemsByFilter'],
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
        activeItem.map((i) => {
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
        activeItem.map((i) => {
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
        activeItem.map((i) => {
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
        activeItem.map((i) => {
          restoreItem({ variables: { key: i } });
        });
      },
    },
  ];
  let commands = allCommands;

  return (
    <CommandPalette
      commands={commands}
      closeOnSelect={true}
      resetInputOnClose={true}
      alwaysRenderCommands={true}
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
        <Tooltip delay={500} label="Show commandbar">
          <IconButton
            aria-label="show command bar"
            variant="invert"
            icon={convertSVGElementToReact(Icons['terminal']())}
            iconColour={theme.colors.gray[100]}
          />
        </Tooltip>
      }
      renderCommand={(suggestion) => {
        return (
          <Flex width={'100%'} justifyContent={'space-between'}>
            {suggestion.highlight ? (
              <span
                dangerouslySetInnerHTML={{ __html: suggestion.highlight }}
              />
            ) : (
              <span>{suggestion.name}</span>
            )}
            {/*   <span className={'command-shortcut'}>{suggestion.shortcut}</span>*/}
          </Flex>
        );
      }}
      onSelect={() => {}}
    />
  );
};
