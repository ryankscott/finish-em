import React from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
} from '@chakra-ui/react'
import { Paragraph } from './Typography'
import { Event } from '../../main/generated/typescript-helpers'
import { format, parseISO } from 'date-fns'

interface Props {
  event: Event
  isOpen: boolean
  footer?: JSX.Element
  onClose: () => void
}

const AttributeContainerStyles = {
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  my: 1,
  mx: 6,
  minH: 6,
}

const AttributeKeyStyles = {
  justifyContent: 'flex-start',
  fontWeight: 'semi-bold',
  alignItems: 'center',
  ml: 0,
  minW: 12,
}

const AttributeValueStyles = {
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  minW: '180px',
  textOverflow: 'ellipsis',
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
            <Flex direction={'row'} {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Paragraph>Time: </Paragraph>
              </Flex>
              <Flex postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                {generateDuration()}
              </Flex>
            </Flex>
            <Flex direction={'row'} {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Paragraph>Location: </Paragraph>
              </Flex>
              <Flex postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                {generateLocation()}
              </Flex>
            </Flex>
            <Flex direction={'row'} {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Paragraph>Attendees: </Paragraph>
              </Flex>
              <Flex postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                {generateAttendees()}
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>{props?.footer}</ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
