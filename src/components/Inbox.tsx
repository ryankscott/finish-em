import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { Title } from './Typography'
import { Container } from './styled/Inbox'
import ItemCreator from './ItemCreator'
import { ItemIcons } from './Item'

function Inbox(): ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Title> Inbox </Title>
                <ItemCreator
                    type="item"
                    buttonText="Add Item"
                    initiallyExpanded={false}
                    projectId={'0'}
                />
                <FilteredItemList
                    listName="Items"
                    filter={{
                        type: 'default',
                        filter: FilterEnum.ShowInbox,
                    }}
                    isFilterable={true}
                    hideIcons={[ItemIcons.Project]}
                />
            </Container>
        </ThemeProvider>
    )
}

export default Inbox
