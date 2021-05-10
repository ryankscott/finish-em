import React, { ReactElement, useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import FilteredItemList from './FilteredItemList'
import { parseISO, format, sub, add, isSameDay, startOfDay, parse, parseJSON } from 'date-fns'
import { Grid, GridItem, Flex, VStack, Text, Box } from '@chakra-ui/react'
import { v5 as uuidv5 } from 'uuid'
import Button from './Button'
import ReorderableComponentList from './ReorderableComponentList'
import { cloneDeep, sortBy, uniqBy } from 'lodash'
import { Event } from '../../main/generated/typescript-helpers'
import RRule from 'rrule'
import { EventModal } from './EventModal'
import { Icons } from '../assets/icons'

const getSortedEventsForToday = (events: Event[], currentDate: Date): Event[] => {
  if (!events?.length) return

  // Set next recurrence to startDate
  const allEvents = events.map((e: Event) => {
    if (!e.recurrence) {
      return e
    }
    const startDate = parseJSON(e.startAt)
    /*
      If you don't have a start date for a recurrence
      RRULE will just use the time now, so you've got to manually 
      set the startDate to the original startDate.
      Then we need to ensure it's all in UTC
    */
    const recurrence = RRule.fromString(e.recurrence)
    recurrence.options.dtstart = parseJSON(startDate)
    recurrence.options.byhour = [startDate.getUTCHours()]
    recurrence.options.byminute = [startDate.getUTCMinutes()]
    recurrence.options.bysecond = [startDate.getUTCSeconds()]
    const nextOccurrence = recurrence.after(new Date(), true)

    // It's possible that there is no next occurrence
    if (nextOccurrence) {
      e.startAt = nextOccurrence.toISOString()
    }
    return e
  })
  // Only get events today
  const eventsToday = allEvents.filter((e: Event) => {
    return isSameDay(parseISO(e.startAt), currentDate)
  })

  // Remove duplicates
  const uniqEvents = uniqBy(eventsToday, 'title')

  // TODO: We can't sort by startAt because recurring tasks will be wrong
  return sortBy(uniqEvents, ['startAt'], ['desc'])
}

type DailyAgendaProps = {}
const GET_DATA = gql`
  query dailyEvents {
    eventsForActiveCalendar {
      key
      title
      startAt
      endAt
      description
      allDay
      recurrence
      attendees {
        name
        email
      }
      location
    }

    calendarIntegration: featureByName(name: "calendarIntegration") {
      key
      enabled
    }
  }
`

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
  const { loading, error, data, refetch } = useQuery(GET_DATA, { pollInterval: 1000 * 60 * 5 })
  // TODO: Gross
  const [currentDate, setDate] = useState(new Date())
  const [showModal, setShowModal] = useState(false)
  const [activeEvent, setActiveEvent] = useState(null)

  const offset = new Date().getTimezoneOffset()
  useEffect(() => {
    window.electron.onReceiveMessage('events-refreshed', (event, arg) => {
      console.log('refreshed events')
    })
  }, [])

  const viewKey = 'ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134'
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const events = cloneDeep(data?.eventsForActiveCalendar)
  const sortedEventsForToday = getSortedEventsForToday(events, currentDate)

  return (
    <Flex m={5} mt={12} padding={5} width="100%" direction="column" maxW="800">
      <Grid templateColumns="repeat(5, 1fr)" width="100%" my={5} mx={1}>
        <GridItem colSpan={1} textAlign={'start'}>
          <Button
            size="md"
            variant="default"
            icon="back"
            onClick={() => {
              setDate(sub(currentDate, { days: 1 }))
            }}
          />
        </GridItem>
        <GridItem colSpan={3} textAlign="center">
          <Text fontWeight={'normal'} color="blue.500" fontSize="3xl" textAlign={'center'}>
            {format(currentDate, 'EEEE do MMMM yyyy')}
          </Text>
        </GridItem>
        <GridItem colSpan={1} textAlign="end">
          <Button
            size="md"
            variant="default"
            icon="forward"
            onClick={() => {
              setDate(add(currentDate, { days: 1 }))
            }}
          />
        </GridItem>
      </Grid>
      <Flex justify="space-between" width="100%" marginBottom="5">
        <Text fontSize="md" style={{ gridArea: 'week_of_year' }}>
          Week of year: {format(currentDate, 'w')} / 52
        </Text>
        <Text fontSize="md" textAlign="end" style={{ gridArea: 'week_of_quarter' }}>
          Week of quarter: {parseInt(format(currentDate, 'w')) % 13} / 13
        </Text>
      </Flex>

      {data.calendarIntegration.enabled && (
        <VStack
          width={'100%'}
          border={'1px solid'}
          borderColor="gray.100"
          padding={3}
          borderRadius="5px"
          spacing={1}
        >
          {sortedEventsForToday ? (
            sortedEventsForToday.map((e: Event) => {
              return (
                <Flex
                  key={e.key}
                  onClick={() => {
                    setActiveEvent(e)
                    setShowModal(!showModal)
                  }}
                  width={'100%'}
                  _hover={{
                    background: 'gray.100',
                    cursor: 'pointer',
                  }}
                  py={1}
                  px={3}
                  borderRadius={5}
                  alignItems={'center'}
                >
                  <Text minW="150px" pr={4} color={'blue.500'} fontSize="md" key={`time-${e.key}`}>
                    {`${format(
                      sub(parseISO(e.startAt), { minutes: offset }),
                      'h:mm aa',
                    )} - ${format(sub(parseISO(e.endAt), { minutes: offset }), 'h:mm aa')}`}
                  </Text>
                  <Text w="100%" fontSize="md" key={`title-${e.title}`}>
                    {e.title}
                  </Text>
                  {e.recurrence && <Box>{Icons['repeat'](12, 12)}</Box>}
                </Flex>
              )
            })
          ) : (
            <Text fontSize="md">No events on this day</Text>
          )}
          <EventModal event={activeEvent} isOpen={showModal} onClose={() => setShowModal(false)} />
        </VStack>
      )}
      <ReorderableComponentList viewKey={viewKey} />
      <Flex p={3} direction="column">
        <FilteredItemList
          key={uuidv5(startOfDay(currentDate).toISOString() + 'due', viewKey)}
          componentKey={uuidv5(startOfDay(currentDate).toISOString() + 'due', viewKey)}
          isFilterable={true}
          showCompletedToggle={true}
          listName="Due Today"
          filter={JSON.stringify({
            text: 'dueAt is today ',
            value: [
              { category: 'dueAt', operator: '=', value: currentDate.toISOString() },
              { conditionType: 'AND', category: 'deleted', operator: '=', value: 'false' },
            ],
          })}
          flattenSubtasks={true}
          readOnly={true}
        />
        <Box h={5} />
        <FilteredItemList
          key={uuidv5(startOfDay(currentDate).toISOString() + 'scheduled', viewKey)}
          componentKey={uuidv5(startOfDay(currentDate).toISOString() + 'scheduled', viewKey)}
          isFilterable={true}
          showCompletedToggle={true}
          listName="Scheduled Today"
          filter={JSON.stringify({
            text: 'scheduledAt = today ',
            value: [
              { category: 'scheduledAt', operator: '=', value: currentDate.toISOString() },
              { conditionType: 'AND', category: 'deleted', operator: '=', value: 'false' },
            ],
          })}
          flattenSubtasks={true}
          readOnly={true}
        />
      </Flex>
    </Flex>
  )
}

export default DailyAgenda
