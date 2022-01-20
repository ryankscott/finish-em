import React from 'react'
import { Flex } from '@chakra-ui/react'

interface Props {
  children: React.ReactNode
}

export const Page = (props: Props) => {
  return (
    <Flex marginTop="14" margin="5" padding="5" width="100%" direction="column" maxW="800">
      {props.children}
    </Flex>
  )
}
