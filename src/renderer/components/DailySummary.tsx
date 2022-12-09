import {
  Circle,
  ColorMode,
  Flex,
  VStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react';

import { add, format, isBefore, parseISO, startOfDay } from 'date-fns';
import { ItemIcons } from 'renderer/interfaces';
import { v4 as uuidv4 } from 'uuid';
import ItemList from './ItemList';

import groupBy from 'lodash/groupBy';
import CalendarAgenda from './CalendarAgenda';

const determineDayTextColour = (listDate: Date, colorMode: ColorMode) => {
  if (isBefore(listDate, startOfDay(new Date()))) {
    if (colorMode === 'light') {
      return 'gray.400';
    }
    return 'gray.600';
  }
  if (colorMode === 'light') {
    return 'gray.800';
  }
  return 'gray.200';
};

// TODO: Fix types
interface DailySummaryPropTypes {
  startOfWeekDate: Date;
  calendarIntegrationEnabled: boolean;
  items: any[];
}

const DailySummary = ({
  startOfWeekDate,
  calendarIntegrationEnabled,
  items,
}: DailySummaryPropTypes) => {
  const { colorMode } = useColorMode();
  const dateFormat = useBreakpointValue(['EEEEE', 'EEEEE', 'EE', 'EEEE']);
  const dates = [...new Array(7)].map((_, i) =>
    add(startOfWeekDate, {
      days: i,
    })
  );

  const itemsByDate = groupBy(items, (i) => {
    return format(parseISO(i?.scheduledAt), 'yyyy-MM-dd');
  });

  return (
    <Flex overflow="scroll" w="100%" px={2} justifyContent="center">
      <Tabs isLazy orientation="horizontal">
        <TabList>
          {dates.map((d) => {
            const itemsOnDate = itemsByDate[format(d, 'yyy-MM-dd')];
            return (
              <Tab key={`tab-${d.toISOString()}`} w="100%">
                <Flex alignItems="center" justifyContent="space-between" py={1}>
                  <Text
                    pr={2}
                    textAlign="start"
                    fontSize="lg"
                    color={determineDayTextColour(d, colorMode)}
                    w="100%"
                    fontWeight={400}
                  >
                    {format(d, dateFormat)}
                  </Text>
                  {itemsOnDate?.length > 0 && (
                    <Circle bg="blue.500" size="16px">
                      <Text
                        justifyContent="center"
                        color="gray.50"
                        fontSize="xs"
                      >
                        {itemsOnDate?.length}
                      </Text>
                    </Circle>
                  )}
                </Flex>
              </Tab>
            );
          })}
        </TabList>

        <TabPanels>
          {dates.map((d) => (
            <TabPanel key={`tabpanel-${d.toISOString()}`} h="100%">
              <VStack>
                {calendarIntegrationEnabled && (
                  <>
                    <Text w="100%" fontSize="lg" textAlign="start">
                      Calendar events
                    </Text>
                    <CalendarAgenda selectedDate={d} />
                  </>
                )}
                <Text w="100%" fontSize="lg" textAlign="start">
                  Items scheduled
                </Text>
                <ItemList
                  componentKey={uuidv4()}
                  inputItems={itemsByDate[format(d, 'yyyy-MM-dd')] || []}
                  flattenSubtasks={false}
                  hiddenIcons={[ItemIcons.Scheduled]}
                />
              </VStack>
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export { DailySummary };
