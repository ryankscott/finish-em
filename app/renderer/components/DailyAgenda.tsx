import React, { ReactElement, useEffect, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import { Paragraph } from './Typography'
import { parseISO, format, sub, add, isSameDay, startOfDay } from 'date-fns'
import { ThemeType } from '../interfaces'
import { v5 as uuidv5 } from 'uuid'
import {
  AgendaContainer,
  DateContainer,
  Section,
  BackContainer,
  ForwardContainer,
  DailyTitle,
  EventsContainer,
  EventContainer,
  EventTime,
  EventTitle,
  RefreshContainer,
} from './styled/DailyAgenda'
import Button from './Button'
import ReorderableComponentList from './ReorderableComponentList'
import { sortBy } from 'lodash'
import { Event } from '../../main/generated/typescript-helpers'
import RRule from 'rrule'
import { Modal } from './Modal'

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
    }

    calendarIntegration: featureByName(name: "calendarIntegration") {
      key
      enabled
    }
    theme @client
  }
`

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
  const { loading, error, data, refetch } = useQuery(GET_DATA, { pollInterval: 1000 * 60 * 5 })
  // TODO: Gross
  const theme: ThemeType = themes[data?.theme]
  const [currentDate, setDate] = useState(new Date())

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
    <ThemeProvider theme={theme}>
      <AgendaContainer>
        <DateContainer>
          <BackContainer>
            <Button
              spacing="compact"
              type="default"
              icon="back"
              onClick={() => {
                setDate(sub(currentDate, { days: 1 }))
              }}
            />
          </BackContainer>
          <DailyTitle>{format(currentDate, 'EEEE do MMMM yyyy')}</DailyTitle>
          <ForwardContainer>
            <Button
              spacing="compact"
              type="default"
              icon="forward"
              onClick={() => {
                setDate(add(currentDate, { days: 1 }))
              }}
            />
          </ForwardContainer>
          <Paragraph style={{ gridArea: 'week_of_year' }}>
            Week of year: {format(currentDate, 'w')} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: 'week_of_quarter' }}>
            Week of quarter: {parseInt(format(currentDate, 'w')) % 13} / 13
          </Paragraph>
        </DateContainer>

        {data.calendarIntegration.enabled && (
          <EventsContainer>
            {eventsToday?.length ? (
              sortedEventsForToday.map((e) => {
                return (
                  <EventContainer key={e.key}>
                    <EventTime key={`time-${e.key}`}>
                      {`${format(parseISO(e.startAt), 'h:mm aa')} - ${format(
                        parseISO(e.endAt),
                        'h:mm aa',
                      )}`}
                    </EventTime>
                    <EventTitle key={`title-${e.title}`}> {e.title} </EventTitle>
                  </EventContainer>
                )
              })
            ) : (
              <p>No events on this day</p>
            )}
          </EventsContainer>
        )}
        <ReorderableComponentList viewKey={viewKey} />
        <Section>
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
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  )
}

export default DailyAgenda
