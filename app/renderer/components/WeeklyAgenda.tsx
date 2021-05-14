import { gql, useMutation, useQuery } from '@apollo/client'
import { add, format, getWeek, isBefore, parseISO, startOfDay, startOfWeek, sub } from 'date-fns'
import groupBy from 'lodash/groupBy'
import React, { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { WeeklyGoal } from '../../main/generated/typescript-helpers'
import { ItemIcons } from '../interfaces'
import Button from './Button'
import EditableText2 from './EditableText2'
import ItemList from './ItemList'
import ReorderableComponentList from './ReorderableComponentList'

import { Grid, GridItem, Box, Flex, Text, useColorMode } from '@chakra-ui/react'

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
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
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
  const { colorMode, toggleColorMode } = useColorMode()
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
  let weeklyGoal: WeeklyGoal = data.weeklyGoals.find(
    (w) => w.week == format(currentDate, 'yyyy-MM-dd'),
  )
  if (!weeklyGoal) {
    weeklyGoal = { key: uuidv4(), week: format(currentDate, 'yyyy-MM-dd'), goal: '' }
  }
  return (
    <Flex m={5} mt={12} padding={5} width="100%" direction="column" maxW="800">
      <Grid templateColumns="repeat(5, 1fr)" width="100%" my={5} mx={1}>
        <GridItem colSpan={1} textAlign={'start'}>
          <Button
            size="md"
            variant="default"
            icon="back"
            onClick={() => {
              setDate(sub(currentDate, { days: 7 }))
            }}
          />
        </GridItem>
        <GridItem colSpan={3} textAlign="center">
          <Text fontWeight={'normal'} color="blue.500" fontSize="3xl" textAlign={'center'}>
            Week starting {format(currentDate, 'EEEE do MMMM yyyy')}
          </Text>
        </GridItem>
        <GridItem colSpan={1} textAlign="end">
          <Button
            size="md"
            variant="default"
            icon="forward"
            onClick={() => {
              setDate(add(currentDate, { days: 7 }))
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
      <Flex
        direction={'column'}
        w={'100%'}
        padding={4}
        padding-left={12}
        border={'1px solid'}
        borderRadius={4}
        borderColor={colorMode == 'light' ? 'gray.100' : 'gray.600'}
        my={6}
        mx={3}
      >
        <Text fontSize="lg" mb={3}>
          Weekly goals
        </Text>
        <EditableText2
          key={weeklyGoal.key}
          singleLine={false}
          input={weeklyGoal.goal}
          placeholder="Add a weekly goal..."
          shouldSubmitOnBlur={true}
          shouldClearOnSubmit={false}
          hideToolbar={false}
          height="120px"
          onUpdate={(input) => {
            createWeeklyGoal({
              variables: {
                key: weeklyGoal?.key,
                week: weeklyGoal.week,
                goal: input,
              },
            })
          }}
        />
      </Flex>
      <Grid templateColumns={'repeat(5, minmax(0, 1fr))'} m={0} mx={3} p={0} w={'100%'}>
        {Array.from({ length: 5 }, (val, idx) => {
          const listDate = add(currentDate, { days: idx })
          return (
            <Box
              py={2}
              px={2}
              border={'1px solid'}
              borderColor={colorMode == 'light' ? 'gray.200' : 'gray.900'}
              borderRadius={5}
              bg={
                isBefore(listDate, startOfDay(new Date()))
                  ? colorMode == 'light'
                    ? 'gray.100'
                    : 'gray.700'
                  : colorMode == 'light'
                  ? 'gray.50'
                  : 'gray.800'
              }
              key={`${idx}-container`}
            >
              <Text p={2} textAlign={'center'} fontSize="lg" key={`${idx}-title`}>
                {format(listDate, 'EEEE')}
              </Text>
              <ItemList
                key={idx}
                compact={true}
                componentKey={uuidv4()}
                inputItems={itemsByDate?.[format(listDate, 'yyyy-MM-dd')] || []}
                flattenSubtasks={false}
                hiddenIcons={[ItemIcons.Scheduled]}
              />
            </Box>
          )
        })}
      </Grid>
      <Flex direction={'row'} w={'100%'} justifyContent={'center'} py={6} px={2}>
        <ReorderableComponentList viewKey={'6c40814f-8fad-40dc-9a96-0454149a9408'} />
      </Flex>
    </Flex>
  )
}

export default WeeklyAgenda
