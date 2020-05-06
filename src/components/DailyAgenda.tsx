import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { format } from 'date-fns'
import { connect } from 'react-redux'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { Paragraph, Title, Header1 } from './Typography'
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import { ItemType } from '../interfaces'
import { AgendaContainer, DateContainer, Section } from './styled/DailyAgenda'
import { RenderingStrategy } from './ItemList'

interface OwnProps {}
interface StateProps {
    dailyGoal: any[]
    items: ItemType[]
}
interface DispatchProps {
    setDailyGoal: (day: string, input: string) => void
}
type DailyAgendaProps = OwnProps & StateProps & DispatchProps

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
    const day = format(new Date(), 'yyyy-MM-dd')
    const editor = React.createRef<HTMLInputElement>()
    return (
        <ThemeProvider theme={theme}>
            <AgendaContainer>
                <DateContainer>
                    <Title style={{ gridArea: 'day' }}>
                        {format(new Date(), 'EEEE do MMMM yyyy')}
                    </Title>
                    <Paragraph style={{ gridArea: 'week_of_year' }}>
                        Week of year: {format(new Date(), 'w')} / 52
                    </Paragraph>
                    <Paragraph style={{ gridArea: 'week_of_quarter' }}>
                        Week of quarter:{' '}
                        {parseInt(format(new Date(), 'w')) % 13} / 13
                    </Paragraph>
                </DateContainer>
                <Header1> Daily Goal </Header1>
                <EditableText
                    style={Paragraph}
                    readOnly={false}
                    input={
                        props.dailyGoal[day]
                            ? props.dailyGoal[day].text
                            : 'No daily goal set'
                    }
                    height={'150px'}
                    singleline={false}
                    ref={editor}
                    onUpdate={(input) => {
                        props.setDailyGoal(day, input)
                    }}
                />
                <Section>
                    <FilteredItemList
                        isFilterable={true}
                        listName="Overdue"
                        filter={FilterEnum.ShowOverdue}
                        showProject={true}
                        renderingStrategy={RenderingStrategy.All}
                    />
                </Section>
                <Section>
                    <FilteredItemList
                        showProject={true}
                        isFilterable={true}
                        listName="Due Today"
                        filter={FilterEnum.ShowDueOnDay}
                        filterParams={{ dueDate: new Date() }}
                        renderingStrategy={RenderingStrategy.All}
                    />
                    <FilteredItemList
                        showProject={true}
                        isFilterable={true}
                        listName="Scheduled Today"
                        filter={FilterEnum.ShowScheduledOnDay}
                        filterParams={{ scheduledDate: new Date() }}
                        renderingStrategy={RenderingStrategy.All}
                    />
                </Section>
            </AgendaContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    items: state.items,
    dailyGoal: state.dailyGoal,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    setDailyGoal: (day, text) => {
        dispatch(setDailyGoal(day, text))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda)
