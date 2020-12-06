import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import ReorderableComponentList from './ReorderableComponentList'
import { Container } from './styled/View'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`
type ViewProps = {
  viewKey: string
}

const View = (props: ViewProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <ReorderableComponentList viewKey={props.viewKey} />
      </Container>
    </ThemeProvider>
  )
}

export default View
