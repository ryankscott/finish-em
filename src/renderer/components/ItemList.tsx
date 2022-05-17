import { ReactElement } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { ItemIcons } from '../interfaces';
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
      <>
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
      </>
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
