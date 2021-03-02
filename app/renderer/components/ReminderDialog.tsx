import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { add, startOfWeek, startOfTomorrow } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import {
  Container,
  HeaderContainer,
  ReminderHeader,
  ReminderContainer,
  BodyContainer,
} from './styled/ReminderDialog'
import Button from './Button'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

const CREATE_REMINDER = gql`
  mutation CreateReminder($key: String!, $text: String!, $remindAt: DateTime, $itemKey: String) {
    createReminder(input: { key: $key, text: $text, remindAt: $remindAt, itemKey: $itemKey }) {
      key
      remindAt
    }
  }
`
const DELETE_REMINDER_FROM_ITEM = gql`
  mutation DeleteReminderFromItem($itemKey: String!) {
    deleteReminderFromItem(input: { itemKey: $itemKey }) {
      key
    }
  }
`

type ReminderDialogProps = {
  itemKey: string
  reminderText: string
  onClose: () => void
}

function ReminderDialog(props: ReminderDialogProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  const [deleteReminderFromItem] = useMutation(DELETE_REMINDER_FROM_ITEM, {
    refetchQueries: ['itemByKey', 'getAppData'],
  })
  const [createReminder] = useMutation(CREATE_REMINDER, {
    refetchQueries: ['itemByKey', 'getAppData'],
  })

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderContainer>
          <ReminderHeader>Remind me: </ReminderHeader>
          <Button
            type="default"
            spacing="compact"
            iconSize="12px"
            onClick={() => {
              props.onClose()
            }}
            icon={'close'}
          />
        </HeaderContainer>
        <BodyContainer>
          <ReminderContainer
            onClick={(e) => {
              createReminder({
                variables: {
                  key: uuidv4(),
                  itemKey: props.itemKey,
                  text: props.reminderText,
                  remindAt: add(new Date(), { minutes: 20 }).toISOString(),
                },
              })
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In 20 minutes'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              createReminder({
                variables: {
                  key: uuidv4(),
                  itemKey: props.itemKey,
                  text: props.reminderText,
                  remindAt: add(new Date(), { hours: 1 }).toISOString(),
                },
              })
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In an hour'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              createReminder({
                variables: {
                  key: uuidv4(),
                  itemKey: props.itemKey,
                  text: props.reminderText,
                  remindAt: add(new Date(), { hours: 3 }).toISOString(),
                },
              })
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In three hours'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              createReminder({
                variables: {
                  key: uuidv4(),
                  itemKey: props.itemKey,
                  text: props.reminderText,
                  remindAt: add(startOfTomorrow(), { hours: 9 }).toISOString(),
                },
              })

              e.stopPropagation()
              props.onClose()
            }}
          >
            {'Tomorrow'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              createReminder({
                variables: {
                  key: uuidv4(),
                  itemKey: props.itemKey,
                  text: props.reminderText,
                  remindAt: add(startOfWeek(new Date(), { weekStartsOn: 1 }), {
                    hours: 9,
                  }).toISOString(),
                },
              })

              e.stopPropagation()
              props.onClose()
            }}
          >
            {'Next week'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              deleteReminderFromItem({ variables: { itemKey: props.itemKey } })
              e.stopPropagation()
              props.onClose()
            }}
          >
            {"Don't remind"}
          </ReminderContainer>
        </BodyContainer>
      </Container>
    </ThemeProvider>
  )
}

export default ReminderDialog
