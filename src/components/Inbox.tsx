import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { Title } from './Typography'
import { Container } from './styled/Inbox'
import ItemCreator from './ItemCreator'

function Inbox(): ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Title> Inbox </Title>
                <ItemCreator type="item" buttonText="Add Item" />
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
