import { ReactElement } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useMutation } from '@apollo/client';
import { cloneDeep } from '@apollo/client/utilities';
import { get } from 'lodash';
import { Box, Text } from '@chakra-ui/react';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  RESTORE_ITEM,
  UNCOMPLETE_ITEM,
} from 'renderer/queries';
import {
  activeItemVar,
  focusbarVisibleVar,
  subtasksVisibleVar,
} from '../cache';
import { item as itemKeymap } from '../keymap';
import { ItemIcons } from '../interfaces/item';
import Item from './Item';

type ItemListProps = {
  componentKey: string;
  inputItems: {
    key: string;
    text: string;
    label: { key: string; name: string };
    project: { key: string; name: string };
    parent: { key: string; name: string };
    children: { key: string }[];
    sortOrder: { sortOrder: number };
  }[];
  hiddenIcons: ItemIcons[];
  flattenSubtasks?: boolean;
  compact?: boolean;
};

function ItemList({
  componentKey,
  inputItems,
  flattenSubtasks,
  compact,
  hiddenIcons,
}: ItemListProps): ReactElement {
  const [completeItem] = useMutation(COMPLETE_ITEM);
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);
  const [restoreItem] = useMutation(RESTORE_ITEM);

  /* TODO: Introduce the following shortcuts:
  - Scheduled At
  - Due At
  - Create subtask
  - Convert to subtask
  - Repeat
  - Add Project
  - Add Area
  - Edit description
 */

  const handlers = {
    TOGGLE_CHILDREN: (event) => {
      const itemKey = event.target.id;
      // TODO: This may be broken
      const newState = cloneDeep(subtasksVisibleVar());
      const newValue = get(newState, [`${itemKey}`, `${componentKey}`], false);
      if (newState[itemKey]) {
        newState[itemKey][componentKey] = !newValue;
      } else {
        newState[itemKey] = {
          [componentKey]: true,
        };
      }
      subtasksVisibleVar(newState);
    },
    NEXT_ITEM: (event) => {
      // Check if there are siblings (subtasks)
      const hasSibling = event.target.nextSibling;
      if (hasSibling) {
        hasSibling.focus();
        return;
      }

      // Otherwise we have to go up a node
      const parent = event.target.parentNode;
      const nextItem = parent?.nextSibling?.firstChild;
      if (nextItem) {
        nextItem.focus();
      }
    },
    PREV_ITEM: (event) => {
      // Check if there are siblings (subtasks)
      const hasSibling = event.target.previousSibling;
      if (hasSibling) {
        hasSibling.focus();
        return;
      }

      // Otherwise we have to go up a node
      const parent = event.target.parentNode;
      const prevItem = parent?.previousSibling?.lastChild;
      if (prevItem) {
        prevItem.focus();
      }
    },
    SET_ACTIVE_ITEM: (event) => {
      const itemKey = event.target.id;
      focusbarVisibleVar(true);
      activeItemVar([itemKey]);
    },
    COMPLETE_ITEM: (event) => {
      const itemKey = event.target.id;
      completeItem({ variables: { key: itemKey } });
    },
    UNCOMPLETE_ITEM: (event) => {
      const itemKey = event.target.id;
      unCompleteItem({ variables: { key: itemKey } });
    },
    DELETE_ITEM: (event) => {
      const itemKey = event.target.id;
      deleteItem({ variables: { key: itemKey } });
    },
    UNDELETE_ITEM: (event) => {
      const itemKey = event.target.id;
      restoreItem({ variables: { key: itemKey } });
    },
  };
  Object.entries(itemKeymap).map(([k, v]) => {
    useHotkeys(v, handlers[k], {
      filter: (event) => {
        const { target } = event;
        const { tagName } = event.target || event.srcElement;
        return !(
          target.contentEditable ||
          tagName === 'INPUT' ||
          tagName === 'SELECT' ||
          tagName === 'TEXTAREA'
        );
      },
      filterPreventDefault: false,
    });
  });

  const renderItem = (i): JSX.Element => {
    if (i === undefined) return <></>;
    /* We want to allow flattening of subtasks which means:
  1. If we should flatten
      - If an item has a parent and the parent is in the list, don't render the parent
  2.  Default
      - If an item has a parent, don't render it (as it will get rendered later)
      - For each item, render the item and it's children  (In the Item component)
*/
    if (flattenSubtasks === true) {
      if (i.parent != null) {
        const parentExistsInList = inputItems.find(
          (z) => z.key === i.parent.key
        );
        // It exists it will get rendered later, so don't render it
        if (parentExistsInList) {
          return <></>;
        }
      }
    }
    return (
      <Box tabIndex={0} key={`container-${i.key}`}>
        <Item
          compact={compact ?? false}
          key={i.key}
          itemKey={i.key}
          componentKey={componentKey}
          shouldIndent={false}
          hiddenIcons={hiddenIcons}
        />

        {i.children?.map((childItem) => {
          // We need to check if the child exists in the original input list
          return (
            <Item
              compact={compact ?? false}
              key={childItem.key}
              itemKey={childItem.key}
              componentKey={componentKey}
              hiddenIcons={
                hiddenIcons
                  ? [...hiddenIcons, ItemIcons.Subtask]
                  : [ItemIcons.Subtask]
              }
              shouldIndent
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Box w="100%" my={4} mx={0} data-cy="item-list">
      {inputItems.map((i) => {
        return renderItem(i);
      })}
      {inputItems.length === 0 && (
        <Text color="gray.400" fontSize="sm" py={4} px={0} pl={4}>
          No items
        </Text>
      )}
    </Box>
  );
}

export default ItemList;
