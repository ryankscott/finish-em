import React, { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import { connect } from 'react-redux'
import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import { Paragraph, Header1 } from './Typography'
import { dateFnsLocalizer } from 'react-big-calendar'
import { parseISO, format, sub, add, parse, startOfWeek, startOfDay, getDay } from 'date-fns'
import 'react-big-calendar/lib/css/react-big-calendar.css'
const locales = {
  de: require('date-fns/locale/de'),
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import { RenderingStrategy, FeatureType, ThemeType } from '../interfaces'
import {
  AgendaContainer,
  DateContainer,
  Section,
  BackContainer,
  ForwardContainer,
  DailyTitle,
  StyledCalendar,
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
    dailyGoals: featureByName(name: "dailyGoals") {
      key
      enabled
    }
    calendarIntegration: featureByName(name: "calendarIntegration") {
      key
      enabled
    }
    getActiveCalendar {
      deleted
      lastUpdatedAt
      deletedAt
      createdAt
      events {
        startAt
        endAt
        createdAt
        description
        allDay
      }
    }
    theme @client
  }
`
const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
  const viewId = 'ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134'
  const [currentDate, setDate] = useState(new Date())
  const editor = React.useRef<HTMLInputElement>()

  const { loading, error, data } = useQuery(GET_DATA)

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const currentCalendar = data.getActiveCalendar
  const hasEvents = currentCalendar?.events

  const theme: ThemeType = themes[data.theme]

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
          <>
            <Header1>Events today: </Header1>
            <StyledCalendar
              localizer={localizer}
              events={
                hasEvents
                  ? currentCalendar.events.map((e) => {
                      return {
                        id: e.id,
                        title: e.title,
                        start: parseISO(e.start),
                        end: parseISO(e.end),
                        description: e.description,
                        allDay: e?.allDay,
                        resource: e?.resource,
                      }
                    })
                  : []
              }
              date={startOfDay(currentDate)}
              onNavigate={() => {}}
              defaultView="agenda"
              length={0}
              views={['agenda', 'day']}
              toolbar={false}
            />
          </>
        )}
        <ReorderableComponentList id={viewId} />
        <Section>
          <FilteredItemList
            componentKey="d94b620e-e298-4a39-a04f-7f0ff47cfdb3"
            isFilterable={true}
            listName="Due Today"
            legacyFilter={`sameDay(dueDate, "${currentDate.toISOString()}")`}
            filter={JSON.stringify({
              text: 'dueAt is today ',
              value: [{ category: 'dueAt', operator: 'is', value: 'today' }],
            })}
            flattenSubtasks={true}
            readOnly={true}
          />
          <FilteredItemList
            componentKey="a4e1c649-378f-4d14-9aac-2d2720270dd8"
            isFilterable={true}
            listName="Scheduled Today"
            legacyFilter={`sameDay(scheduledDate, "${currentDate.toISOString()}")`}
            filter={JSON.stringify({
              text: 'scheduledAt is today ',
              value: [{ category: 'scheduledAt', operator: 'is', value: 'today' }],
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
