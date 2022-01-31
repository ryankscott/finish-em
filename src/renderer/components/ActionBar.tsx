import { useMutation, useReactiveVar } from '@apollo/client';
import { Grid, Flex, Text, IconButton, Tooltip, Box } from '@chakra-ui/react';
import { convertSVGElementToReact, Icons } from 'renderer/assets/icons';
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

  const activeItem = useReactiveVar(activeItemVar);
  if (!activeItem) {
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
      left="0"
      right="0"
      marginLeft="auto"
      marginRight="auto"
      width="100%"
      boxShadow="md"
      borderRadius="4"
      gridGap={0.5}
      gridTemplateRows={'16px 40px'}
      gridTemplateColumns={'repeat(3, 1fr) repeat(2, 24px)'}
      gridTemplateAreas={`
      "items items     items   .        . "
      "due   scheduled project complete delete"`}
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

      <Box gridArea="items">
        <Text
          paddingLeft="4"
          paddingTop="2"
          fontSize="md"
        >{`${activeItem.length} items selected`}</Text>
      </Box>

      <Box gridArea="due">
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
      </Box>

      <Box gridArea="scheduled">
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
      </Box>

      <Box gridArea="project">
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
      </Box>

      <Box gridArea="complete">
        <Tooltip delay={500} label={'Complete items'}>
          <IconButton
            size="md"
            variant="invert"
            aria-label="complete"
            icon={convertSVGElementToReact(
              Icons['todoChecked']('18px', '18px')
            )}
            iconColour={'gray.100'}
            onClick={() => {
              activeItem.map((i) => {
                completeItem({ variables: { key: i } });
              });
            }}
          />
        </Tooltip>
      </Box>

      <Box gridArea="delete">
        <Tooltip delay={500} label={'Delete items'}>
          <IconButton
            size="md"
            variant="invert"
            aria-label="delete"
            icon={convertSVGElementToReact(Icons['trash']('18px', '18px'))}
            iconColour={'gray.100'}
            onClick={() => {
              activeItem.map((i) => {
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
