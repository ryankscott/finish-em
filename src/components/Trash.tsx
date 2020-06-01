import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Title } from './Typography'
import { HeaderContainer, Container, IconContainer } from './styled/Trash'
import FilteredItemList from '../containers/FilteredItemList'
import { RenderingStrategy, ItemType } from '../interfaces'
import { isToday, isThisWeek, isThisMonth, parseISO } from 'date-fns'
import { connect } from 'react-redux'
import { trashIcon } from '../assets/icons'

interface StateProps {
    theme: string
}
type TrashProps = StateProps
const Trash = (props: TrashProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <HeaderContainer>
                <IconContainer>
                    {trashIcon(
                        24,
                        24,
                        themes[props.theme].colours.primaryColour,
                    )}
                </IconContainer>
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
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Trash)
