import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  ColorMode,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Text,
  useBreakpointValue,
  useColorMode,
} from '@chakra-ui/react';
import {
  add,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfWeek,
  sub,
} from 'date-fns';
import groupBy from 'lodash/groupBy';
import { ReactElement, useState } from 'react';
import { Icons } from 'renderer/assets/icons';
import { GET_WEEKLY_ITEMS, SET_WEEKLY_GOAL } from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import { WeeklyGoal } from '../../main/generated/typescript-helpers';
import { ItemIcons } from '../interfaces';
import EditableText from './EditableText';
import ItemList from './ItemList';
import ReorderableComponentList from './ReorderableComponentList';

const weeklyFilter = JSON.stringify({
  combinator: 'and',
  rules: [
    {
      field: 'DATE(scheduledAt)',
      operator: 'between',
      valueSource: 'value',
      value: 'week',
    },
    {
      field: 'deleted',
      operator: '=',
      valueSource: 'value',
      value: false,
    },
  ],
  not: false,
});

const determineDayBgColour = (listDate: Date, colorMode: ColorMode) => {
  if (isBefore(listDate, startOfDay(new Date()))) {
    if (colorMode === 'light') {
      return 'gray.100';
    }
    return 'gray.700';
  }
  if (colorMode === 'light') {
    return 'gray.50';
  }
  return 'gray.800';
};

const WeeklyAgenda = (): ReactElement => {
  const dayOfWeekFormat = useBreakpointValue(['EEE', 'EEE', 'EEEE', 'EEEE']);
  const componentKey = 'ad127825-0574-48d7-a8d3-45375efb5342';
  const { colorMode } = useColorMode();
  const [currentDate, setDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [createWeeklyGoal] = useMutation(SET_WEEKLY_GOAL, {
    refetchQueries: ['weeklyItems'],
  });
  const { loading, error, data } = useQuery(GET_WEEKLY_ITEMS, {
    variables: {
      filter: weeklyFilter,
      componentKey,
    },
  });
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const itemsByDate = groupBy(data.items, (i) => {
    return format(parseISO(i?.scheduledAt), 'yyyy-MM-dd');
  });

  console.log(itemsByDate);

  let weeklyGoal: WeeklyGoal = data.weeklyGoals.find(
    (w) => w.week === format(currentDate, 'yyyy-MM-dd')
  );
  if (!weeklyGoal) {
    weeklyGoal = {
      key: uuidv4(),
      week: format(currentDate, 'yyyy-MM-dd'),
      goal: '',
    };
  }
  return (
    <Flex m={5} mt={12} padding={5} width="100%" direction="column" maxW="800">
      <Grid templateColumns="repeat(5, 1fr)" width="100%" my={5} mx={1}>
        <GridItem colSpan={1} textAlign="start">
          <IconButton
            aria-label="back"
            size="md"
            variant="default"
            icon={<Icon as={Icons.back} />}
            onClick={() => {
              setDate(sub(currentDate, { days: 7 }));
            }}
          />
        </GridItem>
        <GridItem colSpan={3} textAlign="center">
          <Text
            fontWeight="normal"
            color="blue.500"
            fontSize="3xl"
            textAlign="center"
          >
            Week starting {format(currentDate, 'EEEE do MMMM yyyy')}
          </Text>
        </GridItem>
        <GridItem colSpan={1} textAlign="end">
          <IconButton
            aria-label="forward"
            size="md"
            variant="default"
            icon={<Icon as={Icons.forward} />}
            onClick={() => {
              setDate(add(currentDate, { days: 7 }));
            }}
          />
        </GridItem>
      </Grid>
      <Flex justify="space-between" width="100%" marginBottom="5">
        <Text fontSize="md" style={{ gridArea: 'week_of_year' }}>
          Week of year: {format(currentDate, 'w')} / 52
        </Text>
        <Text
          fontSize="md"
          textAlign="end"
          style={{ gridArea: 'week_of_quarter' }}
        >
          Week of quarter: {parseInt(format(currentDate, 'w'), 10) % 13} / 13
        </Text>
      </Flex>
      <Flex
        direction="column"
        w="100%"
        padding={4}
        padding-left={12}
        border="1px solid"
        borderRadius="md"
        borderColor={colorMode === 'light' ? 'gray.100' : 'gray.600'}
        my={6}
        mx={3}
      >
        <Text fontSize="lg" mb={3}>
          Weekly goals
        </Text>
        <EditableText
          key={weeklyGoal.key}
          singleLine={false}
          input={weeklyGoal.goal ?? ''}
          placeholder="Add a weekly goal..."
          shouldSubmitOnBlur
          shouldClearOnSubmit={false}
          hideToolbar={false}
          height="120px"
          onUpdate={(input) => {
            createWeeklyGoal({
              variables: {
                key: weeklyGoal?.key,
                week: weeklyGoal.week,
                goal: input,
              },
            });
          }}
        />
      </Flex>
      <Grid
        templateColumns="repeat(5, minmax(0, 1fr))"
        m={0}
        mx={3}
        p={0}
        w="100%"
      >
        {Array.from({ length: 5 }, (_, idx) => {
          const listDate = add(currentDate, { days: idx });
          return (
            <Box
              py={2}
              px={2}
              border="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
              borderRadius="md"
              bg={determineDayBgColour(listDate, colorMode)}
              key={`${idx}-container`}
            >
              <Text p={2} textAlign="center" fontSize="lg" key={`${idx}-title`}>
                {format(listDate, dayOfWeekFormat ?? 'EEEE')}
              </Text>
              <ItemList
                key={idx}
                compact
                componentKey={uuidv4()}
                inputItems={itemsByDate?.[format(listDate, 'yyyy-MM-dd')] || []}
                flattenSubtasks={false}
                hiddenIcons={[ItemIcons.Scheduled]}
              />
            </Box>
          );
        })}
      </Grid>
      <Flex direction="row" w="100%" justifyContent="center" py={6} px={2}>
        <ReorderableComponentList viewKey="6c40814f-8fad-40dc-9a96-0454149a9408" />
      </Flex>
    </Flex>
  );
};

export default WeeklyAgenda;
