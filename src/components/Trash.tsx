import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import { HeaderContainer, TrashContainer } from './styled/Trash'
import FilteredItemList from '../containers/FilteredItemList'
import { RenderingStrategy, ItemType } from '../interfaces'
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns'

const Trash = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <TrashContainer>
            <HeaderContainer>
                <Title> Trash </Title>
            </HeaderContainer>
            <FilteredItemList
                listName={'Deleted today'}
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == true && isToday(parseISO(i.deletedAt))
                        )
                    },
                }}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
            <FilteredItemList
                listName={'Deleted this week'}
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == true &&
                            isThisWeek(parseISO(i.deletedAt)) &&
                            !isToday(parseISO(i.deletedAt))
                        )
                    },
                }}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
            <FilteredItemList
                listName={'Deleted this month'}
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == true &&
                            isThisMonth(parseISO(i.deletedAt)) &&
                            !isThisWeek(parseISO(i.deletedAt)) &&
                            !isToday(parseISO(i.deletedAt))
                        )
                    },
                }}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
            <FilteredItemList
                listName={'Older'}
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == true &&
                            !isThisMonth(parseISO(i.deletedAt)) &&
                            !isThisWeek(parseISO(i.deletedAt)) &&
                            !isToday(parseISO(i.deletedAt))
                        )
                    },
                }}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
        </TrashContainer>
    </ThemeProvider>
)

export default Trash
