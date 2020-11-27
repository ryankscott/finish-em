import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { HeaderContainer, IconContainer, HeaderTitle } from './styled/ViewHeader'
import { themes } from '../theme'
import { IconType, ThemeType } from '../interfaces'
import { Icons } from '../assets/icons'
import { gql, useQuery } from '@apollo/client'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type ViewHeaderProps = {
  name: string
  icon?: IconType
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
      <HeaderContainer>
        <IconContainer>{Icons[props.icon](24, 24, theme.colours.primaryColour)}</IconContainer>
        <HeaderTitle> {props.name} </HeaderTitle>
      </HeaderContainer>
    </ThemeProvider>
  )
}
export default ViewHeader
