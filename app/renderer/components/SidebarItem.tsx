import { chakra, Flex, Text } from '@chakra-ui/react'
import React from 'react'
import { createShortSidebarItem } from '../utils'
import { v4 as uuidv4 } from 'uuid'
import { Icons } from '../assets/icons'
import Tippy from '@tippyjs/react'
import { Emoji } from 'emoji-mart'
import { NavLink } from 'react-router-dom'
import 'tippy.js/dist/tippy.css'

type SidebarItemProps =
  | {
      variant: 'defaultView'
      sidebarVisible: boolean
      path: string
      text: string
      activeColour: string
      iconName?: string
    }
  | {
      variant: 'customView'
      sidebarVisible: boolean
      path: string
      text: string
      activeColour: string
      emoji?: string
    }

export const SidebarItem = (props: SidebarItemProps): React.ReactElement => {
  const StyledLink = chakra(NavLink)
  const linkStyles = {
    color: 'gray.100',
    w: '100%',
    borderRadius: 4,
    py: 1.25,
    m: 0,
    my: 0.25,
    px: props.sidebarVisible ? 1 : 0,
    _focus: {
      outlineColor: 'blue.500',
      border: 'none',
      bg: 'gray.900',
    },
    _hover: {
      bg: 'gray.900',
    },
    _active: {
      bg: 'gray.900',
    },
  }

  if (props.sidebarVisible) {
    return (
      <Tippy delay={500} content={props.text}>
        <StyledLink
          activeStyle={{
            backgroundColour: props.activeColour,
          }}
          {...linkStyles}
          to={props.path}
        >
          <Flex
            key={uuidv4()}
            focusBorderColor={'blue.500'}
            m={0}
            px={2}
            py={0}
            justifyContent="flex-start"
            alignItems={'center'}
          >
            {props.variant == 'defaultView' && props.iconName && Icons[props.iconName](16, 16)}
            {props.variant == 'customView' && props.emoji && (
              <Emoji emoji={props.emoji} size={14} native={true} />
            )}
            <Text key={uuidv4()} p={0} pl={1} m={0} color={'gray.100'} fontSize="md">
              {props.text}
            </Text>
          </Flex>
        </StyledLink>
      </Tippy>
    )
  }

  return (
    <Tippy delay={500} content={props.text}>
      <StyledLink
        activeStyle={{
          backgroundColour: props.activeColour,
        }}
        {...linkStyles}
        to={props.path}
      >
        <Flex justifyContent="center">
          {props.variant == 'defaultView' && props.iconName && Icons[props.iconName](20, 20)}
          {props.variant == 'customView' && props.emoji && (
            <Emoji emoji={props.emoji} size={16} native={true} />
          )}
          {props.variant == 'customView' && !props.emoji && (
            <Text textAlign={'center'} fontSize="md" color={'gray.100'}>
              {createShortSidebarItem(props.text)}
            </Text>
          )}
        </Flex>
      </StyledLink>
    </Tippy>
  )
}
export default SidebarItem
