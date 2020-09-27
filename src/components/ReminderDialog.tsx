import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
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
import { createReminder, deleteReminderFromItem } from '../actions/reminders'
import Button from './Button'

interface StateProps {
  theme: string
}

interface DispatchProps {
  createReminder: (itemId: string, text: string, time: string) => void
  deleteReminderFromItem: (itemId: string) => void
}
interface OwnProps {
  itemId: string
  reminderText: string
  onClose: () => void
}

type ReminderDialogProps = OwnProps & StateProps & DispatchProps
function ReminderDialog(props: ReminderDialogProps): ReactElement {
  const theme = themes[props.theme]

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
              props.createReminder(
                props.itemId,
                props.reminderText,
                add(new Date(), { minutes: 20 }).toISOString(),
              )
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In 20 minutes'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              props.createReminder(
                props.itemId,
                props.reminderText,
                add(new Date(), { hours: 1 }).toISOString(),
              )
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In an hour'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              props.createReminder(
                props.itemId,
                props.reminderText,
                add(new Date(), { hours: 3 }).toISOString(),
              )
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'In three hours'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              props.createReminder(
                props.itemId,
                props.reminderText,
                add(startOfTomorrow(), { hours: 9 }).toISOString(),
              )
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'Tomorrow'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              props.createReminder(
                props.itemId,
                add(startOfWeek(new Date(), { weekStartsOn: 1 }), {
                  hours: 9,
                }).toISOString(),
                props.reminderText,
              )
              e.stopPropagation()
              props.onClose()
            }}
          >
            {'Next week'}
          </ReminderContainer>
          <ReminderContainer
            onClick={(e) => {
              props.deleteReminderFromItem(props.itemId)
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

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
  createReminder: (itemId: string, text: string, time: string) => {
    dispatch(createReminder(uuidv4(), text, time, itemId))
  },
  deleteReminderFromItem: (itemId: string) => {
    dispatch(deleteReminderFromItem(itemId))
  },
})

export default connect(mapStateToProps, mapDispatchToProps)(ReminderDialog)
