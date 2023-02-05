import { useMutation } from '@apollo/client';
import {
  Grid,
  Flex,
  Text,
  IconButton,
  Tooltip,
  Box,
  Icon,
} from '@chakra-ui/react';
import { Icons } from 'renderer/assets/icons';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  WEEKLY_ITEMS,
  ITEMS_BY_FILTER,
  SET_DUE_AT,
  SET_PROJECT,
  SET_SCHEDULED_AT,
} from 'renderer/queries';
import { AppState, useBoundStore } from 'renderer/state';
import DatePicker from './DatePicker';
import ProjectSelect from './ProjectSelect';

const ActionBar = () => {
  const [completeItem] = useMutation(COMPLETE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);
  const [setProject] = useMutation(SET_PROJECT, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setDueAt] = useMutation(SET_DUE_AT, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: [ITEMS_BY_FILTER, WEEKLY_ITEMS],
  });

  const [activeItemIds, setActiveItemIds, setFocusbarVisible] = useBoundStore(
    (state: AppState) => [
      state.activeItemIds,
      state.setActiveItemIds,
      state.setFocusbarVisible,
    ]
  );

  if (!activeItemIds) {
    return null;
  }

  // TODO: Fix the styling

  return (
    <Grid
      maxW="750px"
      position="absolute"
      zIndex="tooltip"
      alignItems="center"
      padding="2"
      bg="gray.800"
      color="white"
      bottom="0"
      right="0"
      left="0"
      margin="0 auto"
      border="1px solid"
      borderColor="gray.600"
      boxShadow="md"
      borderRadius="md"
      gridRowGap={0.5}
      gridColumnGap={1}
      gridTemplateRows="16px 40px"
      gridTemplateColumns="repeat(3, auto) repeat(2, 32px)"
      gridTemplateAreas={`
      "items items     items   .        . "
      "due   scheduled project complete delete"`}
    >
      <Flex position="absolute" top="2px" right="2px">
        <IconButton
          size="xs"
          variant="dark"
          icon={<Icon as={Icons.close} />}
          color="white"
          onClick={() => {
            setActiveItemIds([]);
            setFocusbarVisible(false);
          }}
          aria-label="close"
        />
      </Flex>

      <Box gridArea="items">
        <Text
          paddingLeft="4"
          paddingTop="2"
          fontSize="md"
        >{`${activeItemIds.length} items selected`}</Text>
      </Box>

      <Box gridArea="due">
        <DatePicker
          forceDark
          key="dd"
          text="Set due date"
          defaultText="Due at: "
          onSubmit={(d: Date | null) => {
            activeItemIds.forEach((i) => {
              setDueAt({ variables: { key: i, dueAt: d } });
            });
          }}
          completed={false}
          deleted={false}
        />
      </Box>

      <Box gridArea="scheduled">
        <DatePicker
          forceDark
          key="sd"
          text="Set scheduled date"
          defaultText="Scheduled at: "
          onSubmit={(d: Date | null) => {
            activeItemIds.forEach((i) => {
              setScheduledAt({ variables: { key: i, scheduledAt: d } });
            });
          }}
          completed={false}
          deleted={false}
        />
      </Box>

      <Box gridArea="project">
        <ProjectSelect
          currentProject={null}
          invertColours
          completed={false}
          deleted={false}
          onSubmit={(projectKey) => {
            activeItemIds.forEach((i) => {
              setProject({ variables: { key: i, projectKey } });
            });
          }}
        />
      </Box>

      <Box gridArea="complete">
        <Tooltip label="Complete items">
          <IconButton
            size="md"
            variant="dark"
            aria-label="complete"
            icon={<Icon as={Icons.todoChecked} />}
            onClick={() => {
              activeItemIds.forEach((i) => {
                completeItem({ variables: { key: i } });
              });
            }}
          />
        </Tooltip>
      </Box>

      <Box gridArea="delete">
        <Tooltip label="Delete items">
          <IconButton
            size="md"
            variant="dark"
            aria-label="delete"
            icon={<Icon as={Icons.trash} />}
            onClick={() => {
              activeItemIds.forEach((i) => {
                deleteItem({ variables: { key: i } });
              });
            }}
          />
        </Tooltip>
      </Box>
    </Grid>
  );
};

export default ActionBar;
