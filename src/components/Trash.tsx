import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { theme } from '../theme'
import { Title } from './Typography'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { RenderingStrategy } from './ItemList'
import { HeaderContainer, TrashContainer } from './styled/Trash'

const Trash = (): ReactElement => (
    <ThemeProvider theme={theme}>
        <TrashContainer>
            <HeaderContainer>
                <Title> Trash </Title>
            </HeaderContainer>
            <FilteredItemList
                filter={FilterEnum.ShowDeleted}
                showProject={true}
                isFilterable={true}
                renderingStrategy={RenderingStrategy.All}
            />
        </TrashContainer>
    </ThemeProvider>
)

export default Trash
