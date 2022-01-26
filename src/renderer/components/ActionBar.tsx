import { useMutation } from '@apollo/client';
import { Grid, GridItem, Flex, Text } from '@chakra-ui/react';
import {
  COMPLETE_ITEM,
  DELETE_ITEM,
  SET_DUE_AT,
  SET_PROJECT,
  SET_SCHEDULED_AT,
} from 'renderer/queries';
import { activeItemVar, focusbarVisibleVar } from '..';
import AttributeSelect from './AttributeSelect';
import Button from './Button';
import DatePicker from './DatePicker';

const ActionBar = () => {
  const [completeItem] = useMutation(COMPLETE_ITEM);
  const [deleteItem] = useMutation(DELETE_ITEM);
  const [setProject] = useMutation(SET_PROJECT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setDueAt] = useMutation(SET_DUE_AT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: ['itemsByFilter', 'weeklyItems'],
  });

  const activeItem = activeItemVar();
  if (!activeItem) {
    return null;
  }

  return (
    <Grid
      maxW="700px"
      position="absolute"
      zIndex="tooltip"
      alignItems="center"
      padding="2"
      bg="gray.800"
      color="white"
      bottom="0"
      left="0"
      right="0"
      marginLeft="auto"
      marginRight="auto"
      width="100%"
      boxShadow="sm"
      borderRadius="4"
      gridRowGap={1}
      gridColumnGap={3}
    >
      <Flex position="absolute" top="2px" right="2px">
        <Button
          size="xs"
          variant="invert"
          icon="close"
          iconSize="12px"
          iconColour="white"
          onClick={() => {
            activeItemVar([]);
            focusbarVisibleVar(false);
          }}
        />
      </Flex>
      <GridItem colSpan={5} rowSpan={1} gridRowGap={2}>
        <Text
          paddingLeft="4"
          paddingTop="2"
          fontSize="md"
        >{`${activeItem.length} items selected`}</Text>
      </GridItem>
      <GridItem colSpan={1}>
        <DatePicker
          key="dd"
          text="Set due date"
          tooltipText="Set due date"
          defaultText="Due at: "
          onSubmit={(d: Date) => {
            activeItem.map((i) => {
              setDueAt({ variables: { key: i, dueAt: d } });
            });
          }}
          completed={false}
          deleted={false}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <DatePicker
          key="sd"
          text="Set scheduled date"
          defaultText="Scheduled at: "
          tooltipText="Set scheduled date"
          onSubmit={(d: Date) => {
            activeItem.map((i) => {
              setScheduledAt({ variables: { key: i, scheduledAt: d } });
            });
          }}
          completed={false}
          deleted={false}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <AttributeSelect
          attribute="project"
          currentAttribute={null}
          invert
          completed={false}
          deleted={false}
          onSubmit={(projectKey) => {
            activeItem.map((i) => {
              setProject({ variables: { key: i, projectKey } });
            });
          }}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <Button
          size="md"
          text="Complete items"
          tooltipText="Complete items"
          variant="invert"
          icon="todoChecked"
          onClick={() => {
            activeItem.map((i) => {
              completeItem({ variables: { key: i } });
            });
          }}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <Button
          size="md"
          text="Delete items"
          tooltipText="Delete items"
          variant="invert"
          icon="trash"
          onClick={() => {
            activeItem.map((i) => {
              deleteItem({ variables: { key: i } });
            });
          }}
        />
      </GridItem>
    </Grid>
  );
};

export default ActionBar;
