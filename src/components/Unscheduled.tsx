import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { RenderingStrategy } from './ItemList'
import { UnscheduledContainer } from './styled/Unscheduled'

const Unscheduled = (): ReactElement => (
  <ThemeProvider theme={theme}>
    <UnscheduledContainer>
      <Title> Unscheduled </Title>
      <FilteredItemList
        filter={FilterEnum.ShowOverdue}
        showProject={true}
        listName="Overdue"
        isFilterable={true}
        renderingStrategy={RenderingStrategy.All}
      />
      <FilteredItemList
        filter={FilterEnum.ShowNotScheduled}
        showProject={true}
        listName="Unscheduled"
        isFilterable={true}
        renderingStrategy={RenderingStrategy.All}
      />
    </UnscheduledContainer>
  </ThemeProvider>
)

const mapStateToProps = (state) => ({
  items: state.items,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Unscheduled)
