import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

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
                filter={{
                    type: 'default',
                    filter: FilterEnum.ShowCompleted,
                }}
                isFilterable={false}
            />
        </CompletedContainer>
    </ThemeProvider>
)

export default Completed
