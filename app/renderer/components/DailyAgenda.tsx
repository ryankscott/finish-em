import React, { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import { connect } from 'react-redux'
import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import { Paragraph, Header1 } from './Typography'
import { parseISO, format, sub, add, isSameDay } from 'date-fns'
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import { ThemeType } from '../interfaces'
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
} from './styled/DailyAgenda'
import Button from './Button'
import ReorderableComponentList from './ReorderableComponentList'

interface StateProps {
  dailyGoal: any[]
}
interface DispatchProps {
  setDailyGoal: (day: string, input: string) => void
}
type DailyAgendaProps = StateProps & DispatchProps

const GET_DATA = gql`
  query {
    eventsForActiveCalendar {
      key
      title
      startAt
      endAt
      description
      allDay
    }
    dailyGoals: featureByName(name: "dailyGoals") {
      key
      enabled
    }
    calendarIntegration: featureByName(name: "calendarIntegration") {
      key
      enabled
    }
    theme @client
  }
`

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_DATA, { pollInterval: 1000 * 60 * 5 })
  // TODO: Gross
  const theme: ThemeType = themes[data?.theme]
  const editor = React.useRef<HTMLInputElement>()
  const [currentDate, setDate] = useState(new Date())
  const viewKey = 'ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134'
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  console.log(currentDate)
  console.log(currentDate.toISOString())
  const eventsToday = data?.eventsForActiveCalendar?.filter((e) => {
    return isSameDay(parseISO(e.startAt), currentDate)
  })

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
        {data.dailyGoals.enabled && (
          <>
            <Header1> Daily Goal </Header1>
            <EditableText
              style={Paragraph}
              readOnly={false}
              input={
                props.dailyGoal?.[format(currentDate, 'yyyy-MM-dd')]
                  ? props.dailyGoal[format(currentDate, 'yyyy-MM-dd')].text
                  : ''
              }
              placeholder={'Add a daily goal'}
              height={'150px'}
              singleline={false}
              innerRef={editor}
              onUpdate={(input) => {
                props.setDailyGoal(format(currentDate, 'yyyy-MM-dd'), input)
                return true
              }}
              shouldSubmitOnBlur={true}
              shouldClearOnSubmit={false}
            />
          </>
        )}
        {data.calendarIntegration.enabled && (
          <EventsContainer>
            {eventsToday.length ? (
              eventsToday
                .filter((e) => isSameDay(parseISO(e.startAt), currentDate))
                .map((e) => {
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
            key="d94b620e-e298-4a39-a04f-7f0ff47cfdb3"
            componentKey="d94b620e-e298-4a39-a04f-7f0ff47cfdb3"
            isFilterable={true}
            listName="Due Today"
            legacyFilter={`sameDay(dueDate, "${currentDate.toISOString()}")`}
            filter={JSON.stringify({
              text: 'dueAt is today ',
              value: [{ category: 'dueAt', operator: '=', value: currentDate.toISOString() }],
            })}
            flattenSubtasks={true}
            readOnly={true}
          />
          <FilteredItemList
            key="a4e1c649-378f-4d14-9aac-2d2720270dd8"
            componentKey="a4e1c649-378f-4d14-9aac-2d2720270dd8"
            isFilterable={true}
            listName="Scheduled Today"
            legacyFilter={`sameDay(scheduledDate, "${currentDate.toISOString()}")`}
            filter={JSON.stringify({
              text: 'scheduledAt = today ',
              value: [{ category: 'scheduledAt', operator: '=', value: currentDate.toISOString() }],
            })}
            flattenSubtasks={true}
            readOnly={true}
          />
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  dailyGoal: state.dailyGoal,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
  setDailyGoal: (day, text) => {
    dispatch(setDailyGoal(day, text))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda)
