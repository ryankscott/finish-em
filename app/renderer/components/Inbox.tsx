import { gql, useQuery } from '@apollo/client'
import React, { ReactElement } from 'react'
import { ItemIcons, RenderingStrategy, ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import ItemCreator from './ItemCreator'
import { Container } from './styled/View'
import ViewHeader from './ViewHeader'

const GET_THEME = gql`
  query {
    theme @client
  }
`
const Inbox = (): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container style={{ paddingTop: '60px' }}>
        <ViewHeader name={'Inbox'} icon={'inbox'} />
        <ItemCreator
          type="item"
          buttonText="Add Item"
          initiallyExpanded={true}
          shouldCloseOnSubmit={false}
          projectKey={'0'}
        />
        <div style={{ padding: '20px 10px 10px 10px' }}>
          <FilteredItemList
            componentKey="42c6cea5-785f-4418-bd0f-5f4d388f4497"
            isFilterable={true}
            listName="Inbox"
            filter={JSON.stringify({
              text: 'project = "Inbox"',
              value: [
                { category: 'projectKey', operator: '=', value: '0' },
                { conditionType: 'AND', category: 'deleted', operator: '=', value: 'false' },
              ],
            })}
            flattenSubtasks={true}
            readOnly={true}
            hiddenIcons={[ItemIcons.Project]}
          />
        </div>
      </Container>
    </ThemeProvider>
  )
}

export default Inbox
