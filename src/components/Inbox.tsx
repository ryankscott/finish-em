import React, { Component, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import QuickAdd from './QuickAdd'
import { Header1, Title } from './Typography'
import { Container } from './styled/Inbox'

class Inbox extends Component {
  constructor(props) {
    super(props)
  }
  // TODO: Hack fix to stop React crashing
  // https://github.com/facebook/draft-js/issues/1320
  componentDidCatch(): void {
    this.forceUpdate()
    return
  }

  render(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Title> Inbox </Title>
          <Header1> Add an item </Header1>
          <QuickAdd />
          <FilteredItemList
            filter={FilterEnum.ShowInbox}
            listName="Items"
            isFilterable={true}
            showProject={false}
          />
        </Container>
      </ThemeProvider>
    )
  }
}

const mapStateToProps = (state) => ({
  items: state.items,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
