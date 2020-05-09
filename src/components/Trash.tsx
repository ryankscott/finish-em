import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import { RenderingStrategy } from './ItemList'
import { HeaderContainer, TrashContainer } from './styled/Trash'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'

const Trash = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <TrashContainer>
            <HeaderContainer>
                <Title> Trash </Title>
            </HeaderContainer>
            <FilteredItemList
                filter={{ type: 'default', filter: FilterEnum.ShowDeleted }}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
        </TrashContainer>
    </ThemeProvider>
)

export default Trash
