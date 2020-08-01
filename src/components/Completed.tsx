import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import { Container } from './styled/Completed'
import { isToday, parseISO, isThisMonth, isThisWeek } from 'date-fns'
import { ItemType } from '../interfaces'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'

interface StateProps {
    theme: string
}
type CompletedProps = StateProps
const Completed = (props: CompletedProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <ViewHeader name={'Completed'} icon={'todoChecked'} />
            <FilteredItemList
                listName="Completed today"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return i.completed == true && isToday(parseISO(i.completedAt))
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
