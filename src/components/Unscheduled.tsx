import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { UnscheduledContainer } from './styled/Unscheduled'
import { isPast, endOfDay, parseISO } from 'date-fns'
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
                filter={{
                    type: 'default',
                    filter: FilterEnum.ShowNotScheduled,
                }}
                listName="Unscheduled"
                isFilterable={true}
            />
        </UnscheduledContainer>
    </ThemeProvider>
)

export default Unscheduled
