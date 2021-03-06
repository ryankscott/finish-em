import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { HeaderContainer, IconContainer, HeaderTitle } from './styled/ViewHeader'
import { themes } from '../theme'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'
import EditViewHeader from './EditViewHeader'

const GET_THEME = gql`
  query {
    theme @client
  }
`
export type ViewHeaderProps = {
  name: string
  icon?: IconType
  readOnly?: boolean
  editing?: boolean
  setEditing?: (editing: boolean) => void
  componentKey: string
}

const ViewHeader = (props: ViewHeaderProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      {props.editing ? (
        <>
          <EditViewHeader
            key={`dlg-${props.componentKey}`}
            componentKey={props.componentKey}
            onClose={() => {
              if (props?.setEditing) {
                props.setEditing(false)
              }
            }}
          />
        </>
      ) : (
        <>
          <HeaderContainer>
            <IconContainer>{Icons[props?.icon](36, 36, theme.colours.primaryColour)}</IconContainer>
            <HeaderTitle> {props.name} </HeaderTitle>
          </HeaderContainer>
        </>
      )}
    </ThemeProvider>
  )
}
export default ViewHeader
