import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { IconType } from '../interfaces'
import { Icons } from '../assets/icons'
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  Text,
  useColorMode,
} from '@chakra-ui/react'

export type MoreDropdownOptions = {
  label: string
  icon: IconType
  onClick: (e: React.MouseEvent) => void
}[]

type MoreDropdownProps = {
  showDialog?: boolean
  disableClick?: boolean
  options: MoreDropdownOptions
}

function MoreDropdown(props: MoreDropdownProps): ReactElement {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Menu matchWidth={true}>
      <MenuButton
        as={IconButton}
        variant={'subtle'}
        color={colorMode == 'light' ? 'gray.800' : 'gray.400'}
        icon={Icons['more'](14, 14)}
      />
      <MenuList minW={'140px'}>
        {props.options.map((v, i) => {
          return (
            <MenuItem borderRadius={5} w={'140px'} key={i} onClick={v.onClick}>
              <Flex direction={'row'} justifyContent={'center'} alignItems={'center'} py={0} px={2}>
                {Icons[v.icon](14, 14)}
                <Text pl={2} fontSize="sm">
                  {v.label}
                </Text>
              </Flex>
            </MenuItem>
          )
        })}
      </MenuList>
    </Menu>
  )
}

export default MoreDropdown
