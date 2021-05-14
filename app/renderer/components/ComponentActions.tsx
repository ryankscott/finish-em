import React, { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import Button from './Button'
import { Flex, useColorMode } from '@chakra-ui/react'
const GET_DATA = gql`
  query {
    views {
      key
      name
    }
  }
`
const DELETE_COMPONENT = gql`
  mutation DeleteComponent($key: String!) {
    deleteComponent(input: { key: $key }) {
      key
    }
  }
`
const CLONE_COMPONENT = gql`
  mutation CloneComponent($key: String!) {
    cloneComponent(input: { key: $key }) {
      key
    }
  }
`

type ComponentActionProps = {
  children: JSX.Element
  componentKey: string
  readOnly?: boolean
}

const ComponentActions = (props: ComponentActionProps): ReactElement => {
  const { colorMode, toggleColorMode } = useColorMode()
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { loading, error, data } = useQuery(GET_DATA)
  const [cloneComponent] = useMutation(CLONE_COMPONENT, { refetchQueries: ['ComponentsByView'] })
  const [deleteComponent] = useMutation(DELETE_COMPONENT, {
    update(cache, { data: { deleteComponent } }) {
      const cacheId = cache.identify({
        __typename: 'Component',
        key: props.componentKey,
      })
      cache.evict({ id: cacheId })
    },
  })
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  let enterInterval, exitInterval

  if (props.readOnly) return <div>{props.children}</div>

  return (
    <Flex
      position={'relative'}
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
            bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
            direction={'column'}
            position={'absolute'}
            right={'-38px'}
            zIndex={9}
            border={'1px solid'}
            borderColor={colorMode == 'light' ? 'gray.200' : 'gray.600'}
            shadow="sm"
            p={0}
            borderRadius={5}
          >
            <Button
              size="md"
              icon={'edit'}
              variant={'default'}
              tooltipText={'Edit component'}
              onClick={() => {
                setIsEditing(true)
              }}
            />
            <Button
              size="md"
              icon={'copy'}
              variant={'default'}
              tooltipText={'Clone component'}
              onClick={() => {
                cloneComponent({ variables: { key: props.componentKey } })
              }}
            />
            <Button
              size="md"
              icon={'move'}
              variant={'default'}
              tooltipText={'Move component'}
              onClick={() => {
                console.log('move')
              }}
            />
            <Button
              size="md"
              icon={'trash'}
              variant={'default'}
              tooltipText={'Delete component'}
              onClick={() => deleteComponent({ variables: { key: props.componentKey } })}
            />
          </Flex>
        </>
      )}
      {React.Children.map(props.children, (c) => {
        return React.cloneElement(props.children, {
          editing: isEditing,
          setEditing: setIsEditing,
        })
      })}
    </Flex>
  )
}

export default ComponentActions
