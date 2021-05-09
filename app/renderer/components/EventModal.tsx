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
  Text,
  Link,
} from '@chakra-ui/react'
import { Event } from '../../main/generated/typescript-helpers'
import { format, parseISO } from 'date-fns'
import Button from './Button'
import { createNote } from '../utils/bear'

interface Props {
  event: Event
  isOpen: boolean
  onClose: () => void
}

const AttributeContainerStyles = {
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  my: 1,
  mx: 3,
  minH: 6,
}

const AttributeKeyStyles = {
  justifyContent: 'flex-start',
  fontWeight: 'semi-bold',
  alignItems: 'center',
  ml: 0,
  minW: '70px',
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
      return <Text fontSize="md"></Text>
    }
    return (
      <Text fontSize="md">
        {format(parseISO(props.event?.startAt), 'h:mm a')} -{' '}
        {format(parseISO(props.event?.endAt), 'h:mm a')}
      </Text>
    )
  }

  const generateLocation = () => {
    if (!props?.event?.location) {
      return <Text fontSize="md">-</Text>
    }
    if (props?.event?.location?.startsWith('http')) {
      return (
        <Link fontSize="md" href={props.event.location}>
          {props.event.location}
        </Link>
      )
    }
    return <Text fontSize="md">{props.event.location} </Text>
  }

  const generateAttendees = () => {
    if (!props?.event?.attendees) {
      return <Text fontSize="md">-</Text>
    }

    return props.event?.attendees?.map((a) => (
      <Text fontSize="md" key={a.name}>
        {a.name}
      </Text>
    ))
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
                <Text fontSize="md">Time: </Text>
              </Flex>
              <Flex pl={3} postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                <Text fontSize="md">{generateDuration()}</Text>
              </Flex>
            </Flex>
            <Flex direction={'row'} {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Text fontSize="md">Location: </Text>
              </Flex>
              <Flex pl={3} postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                {generateLocation()}
              </Flex>
            </Flex>
            <Flex direction={'row'} {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Text fontSize="md">Attendees: </Text>
              </Flex>
              <Flex pl={3} postion={'relative'} direction={'column'} {...AttributeValueStyles}>
                {generateAttendees()}
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button
              text={'Create note'}
              variant={'primary'}
              size="md"
              icon={'bear'}
              iconPosition="right"
              iconColour="white"
              onClick={(e) => {
                const title = `${format(new Date(), 'yyyy-MM-dd')} - ${props.event?.title}`
                const contents = `
_${format(parseISO(props.event?.startAt), 'h:mm a')} - ${format(
                  parseISO(props.event?.endAt),
                  'h:mm a',
                )}_

## Attendees:
${props.event?.attendees
  ?.map((a) => {
    return '- ' + a.name
  })
  .join('\n')}

## Notes:


## Action Items:
`
                window.electron.sendMessage('create-bear-note', {
                  title: title,
                  content: contents,
                })
              }}
            />
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  )
}
