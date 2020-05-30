import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList from '../containers/FilteredItemList'
import { UnscheduledContainer } from './styled/Unscheduled'
import { parseISO, differenceInDays } from 'date-fns'
import { ItemType } from '../interfaces'

const Stale = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <UnscheduledContainer>
            <Title> Stale </Title>
            <FilteredItemList
                listName="Last update more than a week ago"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) > 7 &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) < 31
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Last update more than a month ago"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) > 31
                        )
                    },
                }}
                isFilterable={true}
            />
        </UnscheduledContainer>
    </ThemeProvider>
)

export default Stale
