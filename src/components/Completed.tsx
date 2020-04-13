import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { CompletedContainer, HeaderContainer } from './styled/Completed'

const Completed = (): ReactElement => (
  <ThemeProvider theme={theme}>
    <CompletedContainer>
      <HeaderContainer>
        <Title> Completed </Title>
      </HeaderContainer>
      <FilteredItemList
        filter={FilterEnum.ShowCompleted}
        showProject={true}
        isFilterable={false}
      />
    </CompletedContainer>
  </ThemeProvider>
)

const mapStateToProps = (state) => ({
  items: state.items,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Completed)
