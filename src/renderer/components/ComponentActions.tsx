import React, { ReactElement, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Box, Flex, Icon, IconButton, Tooltip, useColorMode } from '@chakra-ui/react'
import { CLONE_COMPONENT, DELETE_COMPONENT, GET_COMPONENTS_BY_VIEW } from '../queries'
import { Icons } from '../assets/icons'

type ComponentActionProps = {
  children: JSX.Element
  componentKey: string
  readOnly?: boolean
}

const ComponentActions = ({
  children,
  componentKey,
  readOnly
}: ComponentActionProps): ReactElement => {
  const { colorMode } = useColorMode()
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [cloneComponent] = useMutation(CLONE_COMPONENT, {
    refetchQueries: [GET_COMPONENTS_BY_VIEW]
  })
  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    refetchQueries: [GET_COMPONENTS_BY_VIEW]
  })
  let enterInterval: NodeJS.Timeout
  let exitInterval: NodeJS.Timeout

  if (readOnly) return <div>{children}</div>

  return (
    <Flex
      position="relative"
      onMouseEnter={() => {
        enterInterval = setTimeout(() => setShowActions(true), 250)
        clearTimeout(exitInterval)
      }}
      onMouseLeave={() => {
        clearTimeout(enterInterval)
        exitInterval = setTimeout(() => setShowActions(false), 400)
      }}
    >
      {showActions && (
        <>
          <Flex
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
            direction="column"
            position="absolute"
            right="-38px"
            zIndex={9}
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            shadow="sm"
            p={0}
            borderRadius="md"
          >
            <Tooltip label="Edit component">
              <Box>
                <IconButton
                  size="md"
                  icon={<Icon as={Icons.edit} />}
                  variant="default"
                  onClick={() => {
                    setIsEditing(true)
                  }}
                  aria-label="Edit"
                />
              </Box>
            </Tooltip>
            <Tooltip label="Clone component">
              <Box>
                <IconButton
                  aria-label="clone"
                  size="md"
                  icon={<Icon as={Icons.copy} />}
                  variant="default"
                  onClick={() => {
                    cloneComponent({ variables: { key: componentKey } })
                  }}
                />
              </Box>
            </Tooltip>
            <Tooltip label="Move component">
              <Box>
                <IconButton
                  aria-label="move"
                  size="md"
                  icon={<Icon as={Icons.move} />}
                  variant="default"
                  onClick={() => {
                    console.log('move')
                  }}
                />
              </Box>
            </Tooltip>
            <Tooltip label="Delete component">
              <Box>
                <IconButton
                  aria-label="delete"
                  icon={<Icon as={Icons.trash} />}
                  variant="default"
                  onClick={() => deleteComponent({ variables: { key: componentKey } })}
                />
              </Box>
            </Tooltip>
          </Flex>
        </>
      )}
      {React.Children.map(children, () => {
        return React.cloneElement(children, {
          editing: isEditing,
          setEditing: setIsEditing
        })
      })}
    </Flex>
  )
}

export default ComponentActions
