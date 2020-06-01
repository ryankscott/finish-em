import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Title } from './Typography'
import FilteredItemList from '../containers/FilteredItemList'
import { Container, HeaderContainer, IconContainer } from './styled/Unscheduled'
import {
    isPast,
    endOfDay,
    parseISO,
    isToday,
    isThisWeek,
    isThisMonth,
} from 'date-fns'
import { ItemType } from '../interfaces'
import { connect } from 'react-redux'
import { scheduledIcon } from '../assets/icons'

interface StateProps {
    theme: string
}
type UnscheduledProps = StateProps
const Unscheduled = (props: UnscheduledProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <HeaderContainer>
                <IconContainer>
                    {scheduledIcon(
                        24,
                        24,
                        themes[props.theme].colours.primaryColour,
                    )}
                </IconContainer>
                <Title>Unscheduled</Title>
            </HeaderContainer>
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
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Unscheduled)
