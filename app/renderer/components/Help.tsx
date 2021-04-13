import React, { ReactElement } from 'react'
import marked from 'marked'
import helpText from '../assets/help.md'
import shortcutsText from '../assets/shortcuts.md'
import { Flex } from '@chakra-ui/layout'

export const Help = (): ReactElement => {
  return (
    <Flex w={'100%'} maxW={'700px'} direction={'column'} py={6} px={3}>
      <div dangerouslySetInnerHTML={{ __html: marked(helpText, { breaks: true }) }}></div>
      <div dangerouslySetInnerHTML={{ __html: marked(shortcutsText, { breaks: true }) }}></div>
    </Flex>
  )
}

export default Help
