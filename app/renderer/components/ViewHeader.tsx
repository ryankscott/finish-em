import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { HeaderContainer, IconContainer, HeaderTitle, ButtonContainer } from './styled/ViewHeader'
import { themes } from '../theme'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import Button from './Button'
import EditViewHeader from './EditViewHeader'

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

export type ViewHeaderProps = {
  name: string
  icon?: IconType
  componentKey: string
  readOnly?: boolean
}

const ViewHeader = (props: ViewHeaderProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false)
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

  return (
    <ThemeProvider theme={theme}>
      {isEditing ? (
        <>
          <EditViewHeader
            key={`dlg-${props.componentKey}`}
            componentKey={props.componentKey}
            onClose={() => {
              setIsEditing(false)
            }}
          />
        </>
      ) : (
        <>
          <HeaderContainer>
            <IconContainer>{Icons[props?.icon](24, 24, theme.colours.primaryColour)}</IconContainer>
            <HeaderTitle> {props.name} </HeaderTitle>
            {props.readOnly != true && (
              <ButtonContainer>
                <Button
                  icon={'edit'}
                  type={'default'}
                  onClick={() => {
                    setIsEditing(!isEditing)
                  }}
                />
                <Button
                  icon={'trash'}
                  type={'default'}
                  onClick={() => deleteComponent({ variables: { key: props.componentKey } })}
                />
              </ButtonContainer>
            )}
          </HeaderContainer>
        </>
      )}
    </ThemeProvider>
  )
}
export default ViewHeader
