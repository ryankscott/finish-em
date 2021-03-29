import React, { ReactElement, useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import FilteredItemList from './FilteredItemList'
import { parseISO, format, sub, add, isSameDay, startOfDay } from 'date-fns'
import { Grid, GridItem, Flex, VStack, Text } from '@chakra-ui/react'
import { v5 as uuidv5 } from 'uuid'
import Button from './Button'
import ReorderableComponentList from './ReorderableComponentList'
import { sortBy } from 'lodash'
import { Event } from '../../main/generated/typescript-helpers'
import RRule from 'rrule'
import { EventModal } from './EventModal'

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
  const eventsToday = data?.eventsForActiveCalendar?.filter((e: Event) => {
    const recurrence = e.recurrence ? RRule.fromString(e?.recurrence) : null
    const nextOccurrence = recurrence ? recurrence.after(new Date()) : null
    return isSameDay(parseISO(e.startAt), currentDate) || isSameDay(nextOccurrence, currentDate)
  })

  const sortedEventsForToday = sortBy(eventsToday, ['startAt'], ['desc'])

  return (
    <Flex marginTop="14" margin="5" padding="5" width="100%" direction="column" maxW="800">
      <Grid templateColumns="repeat(5, 1fr)" width="100%" marginTop="10" margin="5">
        <GridItem colSpan={1}>
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
          <Text color="blue.400" fontSize="xl">
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
          {eventsToday?.length ? (
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
                  borderRadius="5px"
                >
                  <Text minW="150px" pr={4} color={'blue.500'} fontSize="md" key={`time-${e.key}`}>
                    {`${format(parseISO(e.startAt), 'h:mm aa')} - ${format(
                      parseISO(e.endAt),
                      'h:mm aa',
                    )}`}
                  </Text>
                  <Text fontSize="md" key={`title-${e.title}`}>
                    {e.title}
                  </Text>
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
      <Flex margin="5" padding="5" width="100%" direction="column">
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
        <div style={{ height: '20px' }} />
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
