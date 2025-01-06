import React, { ReactElement } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Item } from "../../main/resolvers-types";
import { Flex, useColorMode } from "@chakra-ui/react";
import ItemComponent from "./Item";
import { ItemIcons } from "../interfaces";

type SortableItemProps = {
  id: string;
  item: Item;
  componentKey: string;
  flattenSubtasks: boolean;
  hiddenIcons: ItemIcons[] | undefined;
  hideCompletedSubtasks?: boolean;
  hideDeletedSubtasks?: boolean;
};

function SortableItem({
  id,
  item,
  componentKey,
  flattenSubtasks,
  hiddenIcons,
  hideCompletedSubtasks,
  hideDeletedSubtasks,
}: SortableItemProps): ReactElement {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });
  const { colorMode } = useColorMode();

  return (
    <Flex
      key={`container-${item.key}`}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderColor: "gray.200",
        borderRadius: 3,
        boxShadow: isDragging ? "xl" : "none",
      }}
      position="relative"
      flexDirection="column"
      height="auto"
      userSelect="none"
      p={0}
      m={0}
      {...attributes}
      {...listeners}
    >
      <ItemComponent
        compact={false}
        itemKey={item.key}
        componentKey={componentKey}
        shouldIndent={false}
        hiddenIcons={hiddenIcons}
        hideCollapseIcon={flattenSubtasks}
      />
      <>
        {item?.children?.map((child) => {
          if (!child) return;

          const shouldHideItem =
            (hideCompletedSubtasks && child.completed) ||
            (hideDeletedSubtasks && child.deleted) ||
            flattenSubtasks;

          if (shouldHideItem) return <></>;

          return (
            <ItemComponent
              compact={false}
              parentKey={item.key}
              itemKey={child.key}
              key={child.key}
              componentKey={componentKey}
              shouldIndent
              hideCollapseIcon={flattenSubtasks}
              hiddenIcons={
                hiddenIcons
                  ? [...hiddenIcons, ItemIcons.Subtask]
                  : [ItemIcons.Subtask]
              }
            />
          );
        })}
      </>
    </Flex>
  );
}

export default SortableItem;
