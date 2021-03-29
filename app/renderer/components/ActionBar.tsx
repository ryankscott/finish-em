import { gql, useMutation, useQuery } from '@apollo/client'
import React from 'react'
import { activeItemVar, focusbarVisibleVar } from '..'
import AttributeSelect from './AttributeSelect'
import Button from './Button'
import DatePicker from './DatePicker'
import { Grid, GridItem, Flex, Text } from '@chakra-ui/react'

interface Props {}
const GET_DATA = gql`
  query {
    activeItem @client
  }
`
const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
    }
  }
`
const SET_PROJECT = gql`
  mutation SetProjectOfItem($key: String!, $projectKey: String) {
    setProjectOfItem(input: { key: $key, projectKey: $projectKey }) {
      key
      project {
        key
      }
    }
  }
`

const SET_SCHEDULED_AT = gql`
  mutation SetScheduledAtOfItem($key: String!, $scheduledAt: DateTime) {
    setScheduledAtOfItem(input: { key: $key, scheduledAt: $scheduledAt }) {
      key
      scheduledAt
    }
  }
`
const SET_DUE_AT = gql`
  mutation SetDueAtOfItem($key: String!, $dueAt: DateTime) {
    setDueAtOfItem(input: { key: $key, dueAt: $dueAt }) {
      key
      dueAt
    }
  }
`

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
      scheduledAt
      dueAt
    }
  }
`

export const ActionBar = (props: Props) => {
  const [completeItem] = useMutation(COMPLETE_ITEM)
  const [deleteItem] = useMutation(DELETE_ITEM)
  const [setProject] = useMutation(SET_PROJECT, { refetchQueries: ['itemsByFilter'] })
  const [setDueAt] = useMutation(SET_DUE_AT, { refetchQueries: ['itemsByFilter'] })
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: ['itemsByFilter', 'weeklyItems'],
  })
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  return (
    <Grid
      maxW="650px"
      position="absolute"
      zIndex="tooltip"
      alignItems="center"
      padding="2"
      bg="black"
      color="white"
      bottom="0"
      left="0"
      right="0"
      marginLeft="auto"
      marginRight="auto"
      width="100%"
      boxShadow="sm"
      borderRadius="4"
    >
      <Flex position="absolute" top={'2px'} right={'2px'}>
        <Button
          size="xs"
          variant={'invert'}
          icon={'close'}
          iconSize={'12px'}
          onClick={() => {
            activeItemVar([])
            focusbarVisibleVar(false)
          }}
        />
      </Flex>
      <GridItem colSpan={5} rowSpan={1}>
        <Text paddingLeft="5" fontSize="sm">{`${data.activeItem.length} items selected`}</Text>
      </GridItem>
      <GridItem colSpan={1}>
        <DatePicker
          key={'dd'}
          text={'Set due date'}
          tooltipText={'Set due date'}
          searchPlaceholder={'Due at: '}
          onSubmit={(d: Date) => {
            data.activeItem.map((i) => {
              setDueAt({ variables: { key: i, dueAt: d } })
            })
          }}
          icon="due"
          completed={false}
          deleted={false}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <DatePicker
          key={'sd'}
          text={'Set scheduled date'}
          searchPlaceholder={'Scheduled at: '}
          tooltipText={'Set scheduled date'}
          onSubmit={(d: Date) => {
            data.activeItem.map((i) => {
              setScheduledAt({ variables: { key: i, scheduledAt: d } })
            })
          }}
          icon="scheduled"
          completed={false}
          deleted={false}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <AttributeSelect
          attribute="project"
          currentAttribute={null}
          invert={true}
          completed={false}
          deleted={false}
          onSubmit={(projectKey) => {
            data.activeItem.map((i) => {
              setProject({ variables: { key: i, projectKey: projectKey } })
            })
          }}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <Button
          size="sm"
          text="Complete items"
          tooltipText={'Complete items'}
          variant={'invert'}
          icon={'todoChecked'}
          onClick={() => {
            data.activeItem.map((i) => {
              completeItem({ variables: { key: i } })
            })
          }}
        />
      </GridItem>
      <GridItem colSpan={1}>
        <Button
          size="sm"
          text="Delete items"
          tooltipText={'Delete items'}
          variant={'invert'}
          icon={'trash'}
          onClick={() => {
            data.activeItem.map((i) => {
              deleteItem({ variables: { key: i } })
            })
          }}
        />
      </GridItem>
    </Grid>
  )
}
