import { format, isSameDay, parseISO, sub } from "date-fns";
import { Event } from "../resolvers-types";
import { useState } from "react";
import { Icons } from "../assets/icons";

import { cloneDeep, sortBy, uniqBy } from "lodash";
import { Flex, Text, Icon, useColorMode } from "@chakra-ui/react";
import EventModal from "./EventModal";
import { RRule } from "rrule";
import { useQuery } from "@apollo/client";
import { GET_DAILY_EVENTS } from "../queries/dailyagenda";

const getSortedEventsForToday = (
  events: Event[],
  currentDate: Date
): Event[] => {
  if (!events?.length) return [];

  // Set next recurrence to startDate
  const allEvents = events.map((e: Event) => {
    if (!e.recurrence) {
      return e;
    }
    const startDate = parseISO(e.startAt ?? "");
    /*
      If you don't have a start date for a recurrence
      RRULE will just use the time now, so you've got to manually
      set the startDate to the original startDate.
      Then we need to ensure it's all in UTC
    */
    const recurrence = RRule.fromString(e.recurrence);
    recurrence.options.dtstart = startDate;
    recurrence.options.byhour = [startDate.getUTCHours()];
    recurrence.options.byminute = [startDate.getUTCMinutes()];
    recurrence.options.bysecond = [startDate.getUTCSeconds()];
    const nextOccurrence = recurrence.after(new Date(), true);

    // It's possible that there is no next occurrence
    if (nextOccurrence) {
      e.startAt = nextOccurrence.toISOString();
    }
    return e;
  });
  // Only get events today
  const eventsToday = allEvents.filter((e: Event) => {
    return isSameDay(parseISO(e.startAt ?? ""), currentDate);
  });

  // Remove duplicates
  const uniqEvents = uniqBy(eventsToday, "title");

  // TODO: We can't sort by startAt because recurring tasks will be wrong
  // @ts-ignore
  return sortBy(uniqEvents, ["startAt"], ["desc"]);
};

interface CalendarAgendaProps {
  selectedDate: Date;
}
export default function CalendarAgenda({ selectedDate }: CalendarAgendaProps) {
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_DAILY_EVENTS, {
    pollInterval: 1000 * 60 * 5,
  });
  const [showModal, setShowModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState<Event>();
  const offset = new Date().getTimezoneOffset();

  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const { eventsForActiveCalendar, calendarIntegration } = data;
  if (!calendarIntegration.enabled) return <></>;
  const events = cloneDeep(eventsForActiveCalendar);

  const sortedEventsForToday: Event[] = getSortedEventsForToday(
    events,
    selectedDate
  );

  if (sortedEventsForToday.length == 0)
    return (
      <Text w="100%" color={"gray.400"} fontSize="sm" py={4} px={0} pl={4}>
        No calendar events
      </Text>
    );
  return (
    <>
      {sortedEventsForToday.map((e: Event) => {
        return (
          <Flex
            key={e.key}
            onClick={() => {
              setActiveEvent(e);
              setShowModal(!showModal);
            }}
            width="100%"
            _hover={{
              background: colorMode === "light" ? "gray.100" : "gray.900",
              cursor: "pointer",
            }}
            py={1}
            px={3}
            borderRadius="md"
            alignItems="center"
          >
            <Flex
              direction="column"
              minW="70px"
              borderRight="2px solid"
              borderColor="blue.500"
              mr={4}
            >
              <Text
                fontSize="sm"
                color={colorMode === "light" ? "gray.800" : "gray.200"}
                key={`time-start-${e.key}`}
              >
                {format(
                  sub(parseISO(e.startAt ?? ""), { minutes: offset }),
                  "h:mm aa"
                )}
              </Text>
              <Text color="gray.500" fontSize="sm" key={`time-end-${e.key}`}>
                {format(
                  sub(parseISO(e.endAt ?? ""), { minutes: offset }),
                  "h:mm aa"
                )}
              </Text>
            </Flex>
            <Text w="100%" fontSize="md" key={`title-${e.title}`}>
              {e.title}
            </Text>
            {e.recurrence && <Icon as={Icons.repeat} />}
          </Flex>
        );
      })}

      <EventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={activeEvent}
      />
    </>
  );
}
