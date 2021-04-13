import React, { ReactElement, useState, useEffect, useRef } from 'react'
import Button from './Button'
import { IconType } from '../interfaces'
import { Icons } from '../assets/icons'
import { Box, Flex } from '@chakra-ui/react'

const DropdownOption = (
  key: number,
  onClick: (e: React.MouseEvent) => void,
  icon: IconType,
  label: string,
): ReactElement => {
  return (
    <Flex
      direction={'row'}
      justifyContent={'flex-start'}
      p={1}
      bg={'gray.50'}
      borderRadius={4}
      fontSize={'sm'}
      zIndex={101}
      _hover={{
        bg: 'gray.100',
      }}
      key={key}
      onClick={onClick}
    >
      <Flex direction={'row'} justifyContent={'center'} alignItems={'center'} py={0} px={2}>
        {Icons[icon](14, 14)}
      </Flex>
      {label}
    </Flex>
  )
}

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
  const [showDialog, setShowDialog] = useState(false)

  const node = useRef<HTMLDivElement>()

  const handleClick = (e): null => {
    if (node.current.contains(e.target)) {
      return
    }
    setShowDialog(false)
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  }, [])

  return (
    <Box py={2} position={'relative'} zIndex={100} ref={node}>
      <Button
        variant={'subtle'}
        icon="more"
        size="sm"
        tooltipText="More actions"
        onClick={(e) => {
          setShowDialog(!showDialog)
          e.stopPropagation()
        }}
      />

      {(showDialog || props.showDialog) && (
        <>
          <Flex
            bg={'gray.50'}
            position={'absolute'}
            direction={'column'}
            py={1}
            px={0}
            m={0}
            border={'1px solid'}
            borderColor={'gray.200'}
            borderRadius={4}
            minW={'140px'}
            zIndex={100}
            right={0}
            shadow="sm"
            onClick={() => {
              setShowDialog(false)
            }}
          >
            {props.options.map((v, i) => DropdownOption(i, v.onClick, v.icon, v.label))}
          </Flex>
        </>
      )}
    </Box>
  )
}

export default MoreDropdown
