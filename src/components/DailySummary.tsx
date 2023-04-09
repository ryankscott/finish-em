import {
  ColorMode,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tag,
  Text,
  useBreakpointValue,
  useColorMode,
  VStack,
} from "@chakra-ui/react";

import { v5 as uuidv5 } from "uuid";

import { add, format, isBefore, parseISO, startOfDay } from "date-fns";
import groupBy from "lodash/groupBy";
import { ItemIcons } from "../interfaces";
import CalendarAgenda from "./CalendarAgenda";
import ItemList from "./ItemList";

const determineDayTextColour = (listDate: Date, colorMode: ColorMode) => {
  if (isBefore(listDate, startOfDay(new Date()))) {
    if (colorMode === "light") {
      return "gray.400";
    }
    return "gray.600";
  }
  if (colorMode === "light") {
    return "gray.800";
  }
  return "gray.200";
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
  const dateFormat = useBreakpointValue(["EEEEE", "EEEEE", "EE", "EEEE"]);
  const dates = [...new Array(7)].map((_, i) =>
    add(startOfWeekDate, {
      days: i,
    })
  );

  const itemsByDate = groupBy(items, (i) => {
    return format(parseISO(i?.scheduledAt), "yyyy-MM-dd");
  });

  return (
    <Flex overflow="scroll" w="100%">
      <Tabs isLazy orientation="vertical">
        <TabList minW="150px">
          {dates.map((d) => {
            const itemsOnDate = itemsByDate[format(d, "yyy-MM-dd")];
            return (
              <Tab key={`tab-${d.toISOString()}`} w="100%" px={4}>
                <Flex
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  py={1}
                  w="100%"
                >
                  <Text
                    pr={1}
                    textAlign="start"
                    fontSize="lg"
                    color={determineDayTextColour(d, colorMode)}
                    fontWeight={400}
                  >
                    {format(d, dateFormat ?? "EEEE")}
                  </Text>
                  {itemsOnDate?.length > 0 && (
                    <Tag colorScheme="blue" size="sm" m={0}>
                      {itemsOnDate?.length}
                    </Tag>
                  )}
                </Flex>
              </Tab>
            );
          })}
        </TabList>

        <TabPanels borderLeft="1px solid" borderColor="chakra-border-color">
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
                  componentKey={uuidv5(
                    format(d, "yyyy-MM-dd"),
                    "9AFBD899-0E31-4C6A-AEC7-17BD2BF5322C"
                  )}
                  inputItems={itemsByDate[format(d, "yyyy-MM-dd")] || []}
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
