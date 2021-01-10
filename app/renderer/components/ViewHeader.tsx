import React, { Component, ReactElement, useEffect, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { HeaderContainer, IconContainer, HeaderTitle } from './styled/ViewHeader'
import { themes } from '../theme'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'
import EditViewHeader from './EditViewHeader'
import ComponentActions from './ComponentActions'

const GET_THEME = gql`
  query {
    theme @client
  }
`
export type ViewHeaderProps = {
  name: string
  icon?: IconType
  readOnly?: boolean
  isEditing: boolean
  onEditingComplete: () => {}
  componentKey: string
}

const ViewHeader = (props: ViewHeaderProps): ReactElement => {
  const [isEditing, setIsEditing] = useState(false)
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <ComponentActions
        readOnly={props.readOnly}
        componentKey={props.componentKey}
        onEdit={() => setIsEditing(true)}
      >
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
              <IconContainer>
                {Icons[props?.icon](24, 24, theme.colours.primaryColour)}
              </IconContainer>
              <HeaderTitle> {props.name} </HeaderTitle>
            </HeaderContainer>
          </>
        )}
      </ComponentActions>
    </ThemeProvider>
  )
}
export default ViewHeader
