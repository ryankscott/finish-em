import React, { ReactElement } from 'react'
import ReorderableComponentList from './ReorderableComponentList'
import { gql, useQuery } from '@apollo/client'
import Project from './Project'
import Area from './Area'
import { Page } from './Page'

const GET_DATA = gql`
  query ViewByKey($key: String!) {
    view(key: $key) {
      key
      name
      type
      icon
    }
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
    case 'area':
      return <Area areaKey={viewKey} />
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
  return (
    <Page>
      {headerComponent(data.view.type, props.viewKey)}
      <ReorderableComponentList viewKey={props.viewKey} />
    </Page>
  )
}

export default View
