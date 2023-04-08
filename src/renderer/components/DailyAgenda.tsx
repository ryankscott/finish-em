import {
  Box,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { DAILY_AGENDA_VIEW_KEY, DAILY_AGENDA_VIEW_NAMESPACE } from 'consts';
import { add, format, parse, startOfDay, sub } from 'date-fns';
import { ReactElement, useEffect, useState } from 'react';
import { Icons } from 'renderer/assets/icons';
import { v5 } from 'uuid';
import CalendarAgenda from './CalendarAgenda';
import FilteredItemList from './FilteredItemList';
import ReorderableComponentList from './ReorderableComponentList';

const DailyAgenda = (): ReactElement => {
  // TODO: Hoist this to a reactive var so others can use it
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const day = window.location.search.split('=')?.[1];
    if (day) setCurrentDate(parse(day, 'yyyy-MM-dd', new Date()));
  }, []);

  return (
    <Flex m={5} mt={12} padding={5} width="100%" direction="column" maxW="800">
      <Grid templateColumns="repeat(5, 1fr)" width="100%" my={5} mx={1}>
        <GridItem colSpan={1} textAlign="start">
          <IconButton
            aria-label="back"
            variant="default"
            icon={<Icon as={Icons.back} />}
            onClick={() => {
              setCurrentDate(sub(currentDate, { days: 1 }));
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
            {format(currentDate, 'EEEE do MMMM yyyy')}
          </Text>
        </GridItem>
        <GridItem colSpan={1} textAlign="end">
          <IconButton
            aria-label="forward"
            variant="default"
            icon={<Icon as={Icons.forward} />}
            onClick={() => {
              setCurrentDate(add(currentDate, { days: 1 }));
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

      <CalendarAgenda selectedDate={currentDate} />
      <ReorderableComponentList viewKey={DAILY_AGENDA_VIEW_KEY} />
      <Flex p={3} direction="column">
        <FilteredItemList
          key={v5(
            `${startOfDay(currentDate).toISOString()}due`,
            DAILY_AGENDA_VIEW_NAMESPACE
          )}
          componentKey={v5(
            `${startOfDay(currentDate).toISOString()}due`,
            DAILY_AGENDA_VIEW_NAMESPACE
          )}
          isFilterable
          showCompletedToggle
          listName="Due Today"
          filter={JSON.stringify({
            combinator: 'and',
            rules: [
              {
                field: 'DATE(dueAt)',
                operator: '=',
                valueSource: 'value',
                value: currentDate.toISOString(),
              },
              {
                field: 'deleted',
                operator: '=',
                valueSource: 'value',
                value: false,
              },
            ],
            not: false,
          })}
          flattenSubtasks
          readOnly
        />
        <Box h={5} />
        <FilteredItemList
          key={v5(
            `${startOfDay(currentDate).toISOString()}scheduled`,
            DAILY_AGENDA_VIEW_NAMESPACE
          )}
          componentKey={v5(
            `${startOfDay(currentDate).toISOString()}scheduled`,
            DAILY_AGENDA_VIEW_NAMESPACE
          )}
          isFilterable
          showCompletedToggle
          listName="Scheduled Today"
          filter={JSON.stringify({
            combinator: 'and',
            rules: [
              {
                field: 'DATE(scheduledAt)',
                operator: '=',
                valueSource: 'value',
                value: currentDate.toISOString(),
              },
              {
                field: 'deleted',
                operator: '=',
                valueSource: 'value',
                value: false,
              },
            ],
            not: false,
          })}
          flattenSubtasks
          readOnly
        />
      </Flex>
    </Flex>
  );
};

export default DailyAgenda;
