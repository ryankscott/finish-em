import React, { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import { Container, ButtonContainer } from './styled/ComponentActions'
const GET_THEME = gql`
  query {
    views {
      key
      name
    }
    theme @client
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
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { loading, error, data } = useQuery(GET_THEME)
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
  const theme: ThemeType = themes[data.theme]
  let enterInterval, exitInterval

  if (props.readOnly) return <div>{props.children}</div>

  return (
    <ThemeProvider theme={theme}>
      <Container
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
            <ButtonContainer>
              <Button
                size="sm"
                icon={'edit'}
                variant={'default'}
                tooltipText={'Edit component'}
                onClick={() => {
                  setIsEditing(true)
                }}
              />
              <Button
                size="sm"
                icon={'copy'}
                variant={'default'}
                tooltipText={'Clone component'}
                onClick={() => {
                  cloneComponent({ variables: { key: props.componentKey } })
                }}
              />
              <Button
                size="sm"
                icon={'move'}
                variant={'default'}
                tooltipText={'Move component'}
                onClick={() => {
                  console.log('move')
                }}
              />
              <Button
                size="sm"
                icon={'trash'}
                variant={'default'}
                tooltipText={'Delete component'}
                onClick={() => deleteComponent({ variables: { key: props.componentKey } })}
              />
            </ButtonContainer>
          </>
        )}
        {React.Children.map(props.children, (c) => {
          return React.cloneElement(props.children, {
            editing: isEditing,
            setEditing: setIsEditing,
          })
        })}
      </Container>
    </ThemeProvider>
  )
}

export default ComponentActions
