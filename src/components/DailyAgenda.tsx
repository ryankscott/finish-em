import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { format, sub, add } from 'date-fns'
import { connect } from 'react-redux'
import { theme } from '../theme'
import FilteredItemList, { FilterEnum } from '../containers/FilteredItemList'
import { Paragraph, Title, Header1 } from './Typography'
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import { ItemType, RenderingStrategy } from '../interfaces'
import {
    AgendaContainer,
    DateContainer,
    Section,
    BackContainer,
    ForwardContainer,
} from './styled/DailyAgenda'
import { Button } from './Button'

interface StateProps {
    dailyGoal: any[]
    items: ItemType[]
}
interface DispatchProps {
    setDailyGoal: (day: string, input: string) => void
}
type DailyAgendaProps = StateProps & DispatchProps

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
    const [date, setDate] = useState(new Date())
    const editor = React.createRef<HTMLInputElement>()
    return (
        <ThemeProvider theme={theme}>
            <AgendaContainer>
                <DateContainer>
                    <BackContainer>
                        <Button
                            spacing="compact"
                            type="default"
                            icon="back"
                            onClick={() => {
                                setDate(sub(date, { days: 1 }))
                            }}
                        />
                    </BackContainer>
                    <Title style={{ gridArea: 'day' }}>
                        {format(date, 'EEEE do MMMM yyyy')}
                    </Title>
                    <ForwardContainer>
                        <Button
                            spacing="compact"
                            type="default"
                            icon="forward"
                            onClick={() => {
                                setDate(add(date, { days: 1 }))
                            }}
                        />
                    </ForwardContainer>
                    <Paragraph style={{ gridArea: 'week_of_year' }}>
                        Week of year: {format(date, 'w')} / 52
                    </Paragraph>
                    <Paragraph style={{ gridArea: 'week_of_quarter' }}>
                        Week of quarter: {parseInt(format(date, 'w')) % 13} / 13
                    </Paragraph>
                </DateContainer>
                <Header1> Daily Goal </Header1>
                <EditableText
                    style={Paragraph}
                    readOnly={false}
                    input={
                        props.dailyGoal[format(date, 'yyyy-MM-dd')]
                            ? props.dailyGoal[format(date, 'yyyy-MM-dd')].text
                            : 'No daily goal set'
                    }
                    height={'150px'}
                    singleline={false}
                    innerRef={editor}
                    onUpdate={(input) => {
                        props.setDailyGoal(format(date, 'yyyy-MM-dd'), input)
                    }}
                    validation={{ validate: false }}
                    shouldSubmitOnBlur={true}
                    shouldClearOnSubmit={false}
                />
                <Section>
                    <FilteredItemList
                        isFilterable={true}
                        listName="Overdue"
                        filter={{
                            type: 'default',
                            filter: FilterEnum.ShowOverdue,
                        }}
                        renderingStrategy={RenderingStrategy.All}
                        noIndentOnSubtasks={true}
                    />
                </Section>
                <Section>
                    <FilteredItemList
                        showProject={true}
                        isFilterable={true}
                        listName="Due Today"
                        filter={{
                            type: 'default',
                            filter: FilterEnum.ShowDueOnDay,
                            params: { dueDate: date },
                        }}
                        renderingStrategy={RenderingStrategy.All}
                    />
                    <FilteredItemList
                        showProject={true}
                        isFilterable={true}
                        listName="Scheduled Today"
                        filter={{
                            type: 'default',
                            filter: FilterEnum.ShowScheduledOnDay,
                            params: { scheduledDate: date },
                        }}
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
