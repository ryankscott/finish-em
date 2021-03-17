import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/modal'
import { AttributeContainer, AttributeKey, AttributeValue } from './styled/EventModal'
import { Paragraph } from './Typography'
import { Event } from '../../main/generated/typescript-helpers'
import { format, parseISO } from 'date-fns'

interface Props {
  event: Event
  isOpen: boolean
  footer?: JSX.Element
  onClose: () => void
}

export const EventModal = (props: Props) => {
  const generateDuration = () => {
    if (!props?.event?.startAt || !props?.event?.endAt) {
      return ''
    }
    return `${format(parseISO(props.event?.startAt), 'h:mm a')} - ${format(
      parseISO(props.event?.endAt),
      'h:mm a',
    )} `
  }

  const generateLocation = () => {
    if (!props?.event?.location) {
      return '-'
    }
    if (props?.event?.location?.startsWith('http')) {
      return <a href={props.event.location}>{props.event.location}</a>
    }
    return <p>{props.event.location} </p>
  }

  const generateAttendees = () => {
    if (!props?.event?.attendees) {
      return '-'
    }

    return props.event?.attendees?.map((a) => <Paragraph key={a.name}>{a.name}</Paragraph>)
  }
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>{props.event?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Time: </Paragraph>
              </AttributeKey>
              <AttributeValue>{generateDuration()}</AttributeValue>
            </AttributeContainer>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Location: </Paragraph>
              </AttributeKey>
              <AttributeValue>{generateLocation()}</AttributeValue>
            </AttributeContainer>
            <AttributeContainer>
              <AttributeKey>
                <Paragraph>Attendees: </Paragraph>
              </AttributeKey>
              <AttributeValue>{generateAttendees()}</AttributeValue>
            </AttributeContainer>
          </ModalBody>
          <ModalFooter>{props?.footer}</ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
