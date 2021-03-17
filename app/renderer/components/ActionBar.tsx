import { gql, useMutation, useQuery } from '@apollo/client'
import React from 'react'
import { activeItemVar, focusbarVisibleVar } from '..'
import { ThemeProvider } from '../StyledComponents'
import AttributeSelect from './AttributeSelect'
import Button from './Button'
import DatePicker from './DatePicker'
import { Container } from './styled/ActionBar'
import { useTheme } from '@chakra-ui/react'

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
  const theme = useTheme()
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <div style={{ display: 'flex', position: 'absolute', top: '2px', right: '2px' }}>
          <Button
            type={'invert'}
            icon={'close'}
            iconSize={'12px'}
            onClick={() => {
              activeItemVar([])
              focusbarVisibleVar(false)
            }}
          />
        </div>
        <div
          style={{ gridArea: 'ITEMS', padding: '10px 10px 0px 10px' }}
        >{`${data.activeItem.length} items selected`}</div>
        <div style={{ gridArea: 'DUE' }}>
          <DatePicker
            key={'dd'}
            style={'invert'}
            selectPosition={'top'}
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
        </div>
        <div style={{ gridArea: 'SCHEDULED' }}>
          <DatePicker
            key={'sd'}
            style={'invert'}
            selectPosition={'top'}
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
        </div>
        <div style={{ gridArea: 'PROJECT' }}>
          <AttributeSelect
            attribute="project"
            currentAttribute={null}
            style={'invert'}
            completed={false}
            deleted={false}
            onSubmit={(projectKey) => {
              data.activeItem.map((i) => {
                setProject({ variables: { key: i, projectKey: projectKey } })
              })
            }}
          />
        </div>
        <div style={{ gridArea: 'COMPLETE' }}>
          <Button
            text="Complete items"
            tooltipText={'Complete items'}
            type={'invert'}
            icon={'todoChecked'}
            onClick={() => {
              data.activeItem.map((i) => {
                completeItem({ variables: { key: i } })
              })
            }}
          />
        </div>
        <div style={{ gridArea: 'DELETE' }}>
          <Button
            text="Delete items"
            tooltipText={'Delete items'}
            type={'invert'}
            icon={'trash'}
            onClick={() => {
              data.activeItem.map((i) => {
                deleteItem({ variables: { key: i } })
              })
            }}
          />
        </div>
      </Container>
    </ThemeProvider>
  )
}
