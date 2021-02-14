import { add, format, getWeek, isBefore, parseISO, startOfDay, startOfWeek, sub } from 'date-fns'
import React, { ReactElement, useState } from 'react'
import { DragDropContext } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import {
  AgendaContainer,
  BackContainer,
  BacklogContainer,
  ColumnHeader,
  DayContainer,
  ForwardContainer,
  GoalContainer,
  Section,
  WeekContainer,
  WeeklyTitle,
} from './styled/WeeklyAgenda'
import { Header1, Paragraph } from './Typography'
import { WeeklyGoal } from '../../main/generated/typescript-helpers'

import { gql, useMutation, useQuery } from '@apollo/client'
import { ItemIcons, ThemeType } from '../interfaces'
import ItemList from './ItemList'
import groupBy from 'lodash/groupBy'
import EditableText from './EditableText'
import ReorderableComponentList from './ReorderableComponentList'
import { component } from '../../main/schemas/component'
const GET_DATA = gql`
  query weeklyItems($filter: String!, $componentKey: String!) {
    items: itemsByFilter(filter: $filter, componentKey: $componentKey) {
      key
      text
      completed
      deleted
      dueAt
      scheduledAt
      lastUpdatedAt
      createdAt
      reminders {
        key
        remindAt
      }
      project {
        key
      }
      parent {
        key
      }
      children {
        key
        project {
          key
          name
        }
      }
    }
    weeklyGoals {
      key
      week
      goal
    }
    theme @client
  }
`
const CREATE_WEEKLY_GOAL = gql`
  mutation CreateWeeklyGoal($key: String!, $week: String!, $goal: String) {
    createWeeklyGoal(input: { key: $key, week: $week, goal: $goal }) {
      key
      week
      goal
    }
  }
`

type WeeklyAgendaProps = {}

const filter = JSON.stringify({
  text: 'scheduledAt is "this week"',
  value: [{ category: 'scheduledAt', operator: 'is', value: 'this week' }],
})

const WeeklyAgenda = (props: WeeklyAgendaProps): ReactElement => {
  const componentKey = 'ad127825-0574-48d7-a8d3-45375efb5342'
  const goalRef = React.useRef<HTMLInputElement>()
  const [currentDate, setDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [createWeeklyGoal] = useMutation(CREATE_WEEKLY_GOAL, { refetchQueries: ['weeklyItems'] })
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      filter: filter,
      componentKey: componentKey,
    },
  })
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const itemsByDate = groupBy(data.items, (i) => {
    return format(parseISO(i.scheduledAt), 'yyyy-MM-dd')
  })
  const theme: ThemeType = themes[data.theme]
  let weeklyGoal: WeeklyGoal = data.weeklyGoals.find(
    (w) => w.week == format(currentDate, 'yyyy-MM-dd'),
  )
  if (!weeklyGoal) {
    weeklyGoal = { key: uuidv4(), week: format(currentDate, 'yyyy-MM-dd'), goal: '' }
  }
  return (
    <ThemeProvider theme={theme}>
      <AgendaContainer>
        <WeekContainer>
          <BackContainer>
            <Button
              spacing="compact"
              type="default"
              icon="back"
              onClick={() => {
                setDate(sub(currentDate, { days: 7 }))
              }}
            />
          </BackContainer>
          <WeeklyTitle>Week starting {format(currentDate, 'EEEE do MMMM yyyy')}</WeeklyTitle>
          <ForwardContainer>
            <Button
              spacing="compact"
              type="default"
              icon="forward"
              onClick={() => {
                setDate(add(currentDate, { days: 7 }))
              }}
            />
          </ForwardContainer>
          <Paragraph style={{ gridArea: 'week_of_year' }}>
            Week of year: {getWeek(currentDate)} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: 'week_of_quarter', textAlign: 'end' }}>
            Week of quarter: {getWeek(currentDate) % 13} / 13
          </Paragraph>
        </WeekContainer>
        <GoalContainer>
          <Header1>Weekly goals</Header1>
          <EditableText
            input={weeklyGoal.goal}
            width={'100%'}
            height={'150px'}
            style={Paragraph}
            singleline={false}
            placeholder="Add a weekly goal"
            onUpdate={(input) =>
              createWeeklyGoal({
                variables: {
                  key: weeklyGoal?.key,
                  week: weeklyGoal.week,
                  goal: input,
                },
              })
            }
            shouldSubmitOnBlur={true}
            shouldClearOnSubmit={true}
            innerRef={goalRef}
          />
        </GoalContainer>
        <Section>
          <DragDropContext
            onDragEnd={() => {
              console.log('awwwww shit')
            }}
          >
            {Array.from({ length: 5 }, (val, idx) => {
              const listDate = add(currentDate, { days: idx })

              return (
                <DayContainer
                  key={`${idx}-container`}
                  past={isBefore(listDate, startOfDay(new Date()))}
                >
                  <ColumnHeader key={`${idx}-title`}>{format(listDate, 'EEEE')}</ColumnHeader>
                  <ItemList
                    key={idx}
                    compact={true}
                    componentKey={uuidv4()}
                    inputItems={itemsByDate?.[format(listDate, 'yyyy-MM-dd')] || []}
                    flattenSubtasks={false}
                    hiddenIcons={[ItemIcons.Scheduled]}
                  />
                </DayContainer>
              )
            })}
          </DragDropContext>
        </Section>
        <BacklogContainer>
          <ReorderableComponentList viewKey={'6c40814f-8fad-40dc-9a96-0454149a9408'} />
        </BacklogContainer>
      </AgendaContainer>
    </ThemeProvider>
  )
}

export default WeeklyAgenda
