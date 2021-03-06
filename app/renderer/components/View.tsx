import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import ReorderableComponentList from './ReorderableComponentList'
import { Container } from './styled/View'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import Project from './Project'

const GET_DATA = gql`
  query ViewByKey($key: String!) {
    view(key: $key) {
      key
      name
      type
      icon
    }
    theme @client
  }
`
type ViewProps = {
  viewKey: string
}

// TODO: Need to migrate Areas to use views
const headerComponent = (type: string, viewKey: string) => {
  switch (type) {
    case 'project':
      return <Project projectKey={viewKey} />

    default:
      break
  }
}

const View = (props: ViewProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_DATA, {
    variables: {
      key: props.viewKey,
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
      <Container>
        {headerComponent(data.view.type, props.viewKey)}
        <ReorderableComponentList viewKey={props.viewKey} />
      </Container>
    </ThemeProvider>
  )
}

export default View
