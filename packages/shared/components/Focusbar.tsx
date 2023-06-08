import { useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FlexProps,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { parseISO } from "date-fns";
import { ReactElement } from "react";
import { RRule } from "rrule";
import { Icons } from "../assets/icons";
import { IconType, ItemIcons } from "../interfaces";
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
  RENAME_ITEM,
  RESTORE_ITEM,
  SET_AREA,
  SET_DUE_AT,
  SET_LABEL,
  SET_PARENT,
  SET_PROJECT,
  SET_REPEAT,
  SET_SCHEDULED_AT,
  UNCOMPLETE_ITEM,
  WEEKLY_ITEMS,
} from "../queries";
import { Item as ItemType } from "../resolvers-types";
import { AppState, useBoundStore } from "../state";
import { formatRelativeDate } from "../utils";
import AreaSelect from "./AreaSelect";
import DatePicker from "./DatePicker";
import EditableText from "./EditableText";
import Item from "./Item";
import ItemActionButton from "./ItemActionButton";
import ItemCreator from "./ItemCreator";
import ItemSelect from "./ItemSelect";
import LabelSelect from "./LabelSelect";
import ProjectSelect from "./ProjectSelect";
import RepeatPicker from "./RepeatPicker";

const Focusbar = (): ReactElement => {
  const { colorMode } = useColorMode();
  const focusbarPlacement = useBreakpointValue([
    "bottom",
    "bottom",
    "right",
    "right",
  ]) as "bottom" | "right";

  const [activeItemIds, setActiveItemIds, focusbarVisible, setFocusbarVisible] =
    useBoundStore((state: AppState) => [
      state.activeItemIds,
      state.setActiveItemIds,
      state.focusbarVisible,
      state.setFocusbarVisible,
    ]);
  const { loading, error, data } = useQuery(ITEM_BY_KEY, {
    skip: activeItemIds.length == 0 || !activeItemIds?.[0],
    variables: {
      key: activeItemIds[0],
    },
  });

  const [renameItem] = useMutation(RENAME_ITEM);
  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setProject] = useMutation(SET_PROJECT, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setArea] = useMutation(SET_AREA, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: [ITEMS_BY_FILTER, WEEKLY_ITEMS, ITEM_BY_KEY],
  });
  const [setDueAt] = useMutation(SET_DUE_AT, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY],
  });
  const [setRepeat] = useMutation(SET_REPEAT, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setParent] = useMutation(SET_PARENT, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setLabel] = useMutation(SET_LABEL, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY],
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });

  if (error) {
    console.log(error);
    return <></>;
  }

  if (loading) {
    return (
      <Flex
        direction="column"
        border="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.900"}
        shadow="md"
        minW={focusbarVisible ? "350px" : 0}
        opacity={focusbarVisible ? 1 : 0}
        px={3}
        py={3}
        h="100%"
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
        transition="all 0.2s ease-in-out"
      />
    );
  }

  const item: ItemType = data?.item;

  if (!item) return <></>;

  // TODO: Refactor me
  const AttributeContainer = (props: FlexProps) => (
    <Flex
      justifyContent="space-between"
      width="100%"
      minW="180px"
      px={4}
      my={1}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );

  const SidebarTitle = ({ text, icon }: { text: string; icon: IconType }) => (
    <Flex minW="100px" alignItems="center">
      <Icon as={Icons[icon]} h={3.5} w={3.5} />
      <Text fontSize="md" pl={2}>
        {text}
      </Text>
    </Flex>
  );

  // TODO: Do I need these? Or can I move to the component

  const dueDate = item?.dueAt
    ? formatRelativeDate(parseISO(item?.dueAt))
    : "Add due date";

  const scheduledDate = item?.scheduledAt
    ? formatRelativeDate(parseISO(item?.scheduledAt))
    : "Add scheduled date";

  return (
    <Drawer
      placement={focusbarPlacement ?? "right"}
      isOpen={focusbarVisible}
      onClose={() => setFocusbarVisible(false)}
    >
      <DrawerOverlay />
      <DrawerContent
        border="1px solid"
        borderColor={colorMode === "light" ? "gray.200" : "gray.900"}
        p={4}
        bg={colorMode === "light" ? "gray.50" : "gray.800"}
        minW="400px"
        justifyContent="center"
      >
        <DrawerCloseButton
          size="sm"
          onClick={() => setFocusbarVisible(false)}
        />
        <DrawerHeader>
          <Flex w="100%">
            {item?.parent && (
              <Tooltip label="Up level">
                <IconButton
                  aria-label="up"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    if (item?.parent) {
                      setActiveItemIds([item?.parent?.key]);
                    }
                  }}
                  icon={<Icon p={0} m={0} as={Icons.upLevel} />}
                />
              </Tooltip>
            )}
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Flex direction="column" w="100%">
            <Flex w="100%" justifyContent="space-between" mb={2}>
              <Flex alignItems="center" w="100% ">
                <ItemActionButton
                  deleted={item.deleted ?? false}
                  completed={item.completed ?? false}
                  onClick={() => {
                    if (item.completed) {
                      unCompleteItem({ variables: { key: item.key } });
                    } else {
                      completeItem({ variables: { key: item.key } });
                    }
                  }}
                  disableOnDelete
                  colour={item?.label?.colour ?? undefined}
                />
                <Flex
                  w="100%"
                  maxW="250px"
                  textDecoration={item?.completed ? "line-through" : "inherit"}
                  px={1}
                >
                  <EditableText
                    readOnly={item.deleted ?? false}
                    input={item?.text ?? ""}
                    singleLine
                    shouldClearOnSubmit={false}
                    shouldSubmitOnBlur
                    shouldBlurOnSubmit
                    onSubmit={(text) => {
                      renameItem({ variables: { key: item.key, text } });
                    }}
                  />
                </Flex>
              </Flex>
              {item.deleted ? (
                <Tooltip label="Restore">
                  <IconButton
                    aria-label="restore"
                    variant="default"
                    icon={
                      <Icon p={0} m={0} as={Icons.restore} h={3.5} w={3.5} />
                    }
                    size="sm"
                    onClick={() => {
                      restoreItem({ variables: { key: item.key } });
                    }}
                  />
                </Tooltip>
              ) : (
                <Tooltip label="Delete">
                  <IconButton
                    variant="default"
                    aria-label="delete"
                    icon={<Icon as={Icons.trash} h={3.5} w={3.5} />}
                    onClick={() => {
                      deleteItem({ variables: { key: item.key } });
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            {item.project?.key === "0" && (
              <AttributeContainer>
                <SidebarTitle icon="area" text="Area: " />
                <AreaSelect
                  currentArea={item.area ?? null}
                  completed={item.completed ?? false}
                  deleted={item.deleted ?? false}
                  onSubmit={(areaKey) => {
                    setArea({ variables: { key: item.key, areaKey } });
                  }}
                />
              </AttributeContainer>
            )}
            <AttributeContainer>
              <SidebarTitle icon="project" text="Project: " />
              <ProjectSelect
                currentProjectKey={item?.project?.key ?? null}
                deleted={item.deleted ?? false}
                completed={item.completed ?? false}
                onSubmit={(projectKey: string) => {
                  setProject({
                    variables: {
                      key: item.key,
                      projectKey,
                    },
                  });
                }}
              />
            </AttributeContainer>
            <AttributeContainer>
              <SidebarTitle icon="scheduled" text="Scheduled: " />
              <DatePicker
                key={`sd${item.key}`}
                defaultText="Scheduled at: "
                onSubmit={(d: Date | null) => {
                  setScheduledAt({
                    variables: { key: item.key, scheduledAt: d },
                  });
                }}
                text={scheduledDate}
                completed={item.completed ?? false}
                deleted={item.deleted ?? false}
              />
            </AttributeContainer>
            <AttributeContainer>
              <SidebarTitle icon="due" text="Due: " />
              <DatePicker
                key={`dd${item.key}`}
                defaultText="Due at: "
                onSubmit={(d: Date | null) => {
                  setDueAt({
                    variables: { key: item.key, dueAt: d },
                  });
                }}
                text={dueDate}
                completed={item.completed ?? false}
                deleted={item.deleted ?? false}
              />
            </AttributeContainer>
            <AttributeContainer>
              <SidebarTitle icon="repeat" text="Repeating: " />
              <RepeatPicker
                repeat={
                  item.repeat && item.repeat !== "undefined"
                    ? RRule.fromString(item.repeat)
                    : null
                }
                completed={item.completed ?? false}
                deleted={item.deleted ?? false}
                key={`rp${item.key}`}
                onSubmit={(r: RRule) =>
                  setRepeat({
                    variables: { key: item.key, repeat: r ? r.toString() : "" },
                  })
                }
              />
            </AttributeContainer>
            {item.children?.length === 0 && (
              <AttributeContainer>
                <SidebarTitle icon="subtask" text="Parent: " />
                <ItemSelect
                  currentItem={item}
                  completed={item.completed ?? false}
                  deleted={item.deleted ?? false}
                  onSubmit={(itemKey: string) =>
                    setParent({
                      variables: { key: item.key, parentKey: itemKey },
                    })
                  }
                />
              </AttributeContainer>
            )}
            <AttributeContainer>
              <SidebarTitle icon="label" text="Label: " />
              <LabelSelect
                currentLabelKey={item.label?.key}
                completed={item.completed ?? false}
                deleted={item.deleted ?? false}
                onSubmit={(labelKey) => {
                  setLabel({ variables: { key: item.key, labelKey } });
                }}
              />
            </AttributeContainer>
            {item.deletedAt && (
              <AttributeContainer>
                <SidebarTitle icon="trash" text="Deleted at: " />
                <Text fontSize="md" m={1} py={2} px={3}>
                  {formatRelativeDate(parseISO(item?.deletedAt))}
                </Text>
              </AttributeContainer>
            )}
            {item.completedAt && (
              <AttributeContainer>
                <SidebarTitle icon="todoChecked" text="Completed at: " />
                <Text fontSize="md" m={1} py={2} px={3}>
                  {formatRelativeDate(parseISO(item?.completedAt))}
                </Text>
              </AttributeContainer>
            )}

            {!item.parent?.key && (
              <>
                <Flex pt={6} pb={2} alignItems="baseline">
                  <Text fontSize="md" px={2}>
                    Subtasks
                  </Text>
                  {item.children && item.children?.length > 0 && (
                    <Text fontSize="sm" color="gray.600">
                      {item.children.length} item
                      {item.children.length > 1 ? "s" : ""}
                    </Text>
                  )}
                </Flex>
                {item.children && item.children?.length > 0 ? (
                  <Box
                    overflow="scroll"
                    py={0}
                    px={2}
                    w="100%"
                    key={`box-${item.key}`}
                  >
                    {item.children?.map((childItem) => {
                      if (!childItem) return <></>;
                      return (
                        <Item
                          compact={false}
                          componentKey=""
                          itemKey={childItem.key}
                          shouldIndent={false}
                          hiddenIcons={[ItemIcons.Project, ItemIcons.Subtask]}
                        />
                      );
                    })}
                  </Box>
                ) : (
                  <Text fontSize="md" pl={4} py={2} color="gray.600">
                    No subtasks
                  </Text>
                )}
                <Box p={4}>
                  <ItemCreator
                    parentKey={item.key}
                    initiallyExpanded={false}
                    buttonText="Add subtask"
                  />
                </Box>
              </>
            )}
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default Focusbar;
