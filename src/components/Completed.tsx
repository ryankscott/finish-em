import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Title } from './Typography'
import FilteredItemList from '../containers/FilteredItemList'
import { Container, IconContainer, HeaderContainer } from './styled/Completed'
import { isToday, parseISO, isThisMonth, isThisWeek } from 'date-fns'
import { ItemType } from '../interfaces'
import { connect } from 'react-redux'
import { todoCheckedIcon } from '../assets/icons'

interface StateProps {
    theme: string
}
type CompletedProps = StateProps
const Completed = (props: CompletedProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <HeaderContainer>
                <IconContainer>
                    {todoCheckedIcon(
                        24,
                        24,
                        themes[props.theme].colours.primaryColour,
                    )}
                </IconContainer>
                <Title> Completed </Title>
            </HeaderContainer>
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
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Completed)
