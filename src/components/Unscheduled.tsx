import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList from '../containers/FilteredItemList'
import { UnscheduledContainer } from './styled/Unscheduled'
import {
    isPast,
    endOfDay,
    parseISO,
    isToday,
    isThisWeek,
    isThisMonth,
} from 'date-fns'
import { ItemType } from '../interfaces'

const Unscheduled = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <UnscheduledContainer>
            <Title> Unscheduled </Title>
            <FilteredItemList
                listName="Overdue"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            isPast(endOfDay(parseISO(i.dueDate))) &&
                            i.scheduledDate == null &&
                            i.deleted == false &&
                            i.completed == false
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Created today"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            i.scheduledDate == null &&
                            isToday(parseISO(i.createdAt))
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Created this week"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            i.scheduledDate == null &&
                            !isToday(parseISO(i.createdAt)) &&
                            isThisWeek(parseISO(i.createdAt))
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Created this month"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            i.scheduledDate == null &&
                            !isToday(parseISO(i.createdAt)) &&
                            !isThisWeek(parseISO(i.createdAt)) &&
                            isThisMonth(parseISO(i.createdAt))
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
                            i.deleted == false &&
                            i.completed == false &&
                            i.scheduledDate == null &&
                            !isToday(parseISO(i.createdAt)) &&
                            !isThisWeek(parseISO(i.createdAt)) &&
                            !isThisMonth(parseISO(i.createdAt))
                        )
                    },
                }}
                isFilterable={true}
            />
        </UnscheduledContainer>
    </ThemeProvider>
)

export default Unscheduled
