import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { CompletedContainer, HeaderContainer } from './styled/Completed'
import { isToday, parseISO, isThisMonth, isThisWeek } from 'date-fns'
import { ItemType } from '../interfaces'

const Completed = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <CompletedContainer>
            <HeaderContainer>
                <Title> Completed </Title>
            </HeaderContainer>
            <FilteredItemList
                filter={{
                    type: 'default',
                    filter: FilterEnum.ShowCompleted,
                }}
                isFilterable={false}
            />
            <FilteredItemList
                listName="Completed today"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.completed == true &&
                            isToday(parseISO(i.completedAt))
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Completed this week"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.completed == true &&
                            !isToday(parseISO(i.completedAt)) &&
                            isThisWeek(parseISO(i.completedAt))
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Completed this month"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.completed == true &&
                            !isToday(parseISO(i.completedAt)) &&
                            !isThisWeek(parseISO(i.completedAt)) &&
                            isThisMonth(parseISO(i.completedAt))
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Older"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.completed == true &&
                            !isToday(parseISO(i.completedAt)) &&
                            !isThisWeek(parseISO(i.completedAt)) &&
                            !isThisMonth(parseISO(i.completedAt))
                        )
                    },
                }}
                isFilterable={true}
            />
        </CompletedContainer>
    </ThemeProvider>
)

export default Completed
