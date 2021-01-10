import React, { ReactElement, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import { Container, ButtonContainer } from './styled/ComponentActions'
const GET_THEME = gql`
  query {
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

type ComponentActionProps = {
  children: JSX.Element
  componentKey: string
  readOnly?: boolean
  onEdit: () => void
  onDelete?: () => void
}

const ComponentActions = (props: ComponentActionProps): ReactElement => {
  const [showActions, setShowActions] = useState(false)
  const { loading, error, data } = useQuery(GET_THEME)
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
          exitInterval = setTimeout(() => setShowActions(false), 200)
        }}
      >
        {showActions && (
          <ButtonContainer>
            <Button
              icon={'edit'}
              type={'default'}
              onClick={() => {
                props.onEdit()
              }}
            />
            <Button
              icon={'trash'}
              type={'default'}
              onClick={() => deleteComponent({ variables: { key: props.componentKey } })}
            />
          </ButtonContainer>
        )}
        {props.children}
      </Container>
    </ThemeProvider>
  )
}

export default ComponentActions
