import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import QuickAdd from './QuickAdd'
import { Header1, Title } from './Typography'
import { Container } from './styled/Inbox'

function Inbox(): ReactElement {
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

export default Inbox
