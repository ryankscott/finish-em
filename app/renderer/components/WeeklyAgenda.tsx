import { format, getWeek, startOfWeek } from 'date-fns'
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
  ForwardContainer,
  Section,
  WeekContainer,
  WeeklyTitle,
} from './styled/WeeklyAgenda'
import { Paragraph } from './Typography'

import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
const GET_THEME = gql`
  query {
    theme @client
  }
`

type WeeklyAgendaProps = {}

// {Array.from({ length: 5 }, (val, idx) => {
//   return (
//     <FilteredItemList
//       id={idx}
//       key={idx}
//       showProject={true}
//       isFilterable={true}
//       listName={formatRelativeDate(add(firstDayOfWeek, { days: idx }))}
//       filter={`sameDay(dueDate, "${add(firstDayOfWeek, { days: idx }).toISOString()}")`}
//       renderingStrategy={RenderingStrategy.All}
//       readOnly={true}
//       hideIcons={[ItemIcons.Due, ItemIcons.Scheduled, ItemIcons.Project]}
//       initiallyExpanded={true}
//     />
//   )
// })}

const WeeklyAgenda = (props: WeeklyAgendaProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  const viewId = uuidv4()
  const [currentWeek, setWeek] = useState(getWeek(new Date()))
  const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
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
                setWeek(currentWeek - 1)
              }}
            />
          </BackContainer>
          <WeeklyTitle>Week starting {format(firstDayOfWeek, 'EEEE do MMMM yyyy')}</WeeklyTitle>
          <ForwardContainer>
            <Button
              spacing="compact"
              type="default"
              icon="forward"
              onClick={() => {
                setWeek(currentWeek + 1)
              }}
            />
          </ForwardContainer>
          <Paragraph style={{ gridArea: 'week_of_year' }}>
            Week of year: {currentWeek} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: 'week_of_quarter' }}>
            Week of quarter: {currentWeek % 13} / 13
          </Paragraph>
        </WeekContainer>
        <Section>
          <DragDropContext
            onDragEnd={() => {
              console.log('awwwww shit')
            }}
          >
            <BacklogContainer></BacklogContainer>
            <div></div>
          </DragDropContext>
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  )
}

export default WeeklyAgenda
