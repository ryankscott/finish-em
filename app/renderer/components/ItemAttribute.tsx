import React, { ReactElement } from 'react'
import { Icons } from '../assets/icons'
import marked from 'marked'
import { Flex, Text } from '@chakra-ui/layout'
import { Tooltip } from '@chakra-ui/react'

type ItemAttributeProps = {
  type: 'repeat' | 'due' | 'scheduled' | 'subtask'
  text: string
  tooltipText: string
  completed: boolean
  compact: boolean
}

const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
  const iconSize = props.compact ? 12 : 14
  return (
    <>
      <Tooltip openDelay={500} arrowSize={5} label={props.tooltipText}>
        <Flex
          direction="row"
          alignItems="center"
          py={0}
          px={1}
          my={0}
          mx={1}
          textDecoration={props.completed ? 'strike-through' : 'none'}
        >
          <Flex p={0} m={0} alignItems="center">
            {Icons[props.type](iconSize, iconSize)}
          </Flex>
          <Text
            fontSize="xs"
            fontWeight={'light'}
            px={1}
            dangerouslySetInnerHTML={{ __html: marked(props.text) }}
          ></Text>
        </Flex>
      </Tooltip>
    </>
  )
}
export default ItemAttribute
