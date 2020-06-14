import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { format, sub, add } from 'date-fns'
import { connect } from 'react-redux'
import { themes } from '../theme'
import FilteredItemList from '../containers/FilteredItemList'
import { Paragraph, Header1 } from './Typography'
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import { ItemType, RenderingStrategy, FilterEnum } from '../interfaces'
import {
    AgendaContainer,
    DateContainer,
    Section,
    BackContainer,
    ForwardContainer,
    DailyTitle,
} from './styled/DailyAgenda'
import Button from './Button'

interface StateProps {
    dailyGoal: any[]
    items: ItemType[]
    theme: string
}
interface DispatchProps {
    setDailyGoal: (day: string, input: string) => void
}
type DailyAgendaProps = StateProps & DispatchProps

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
    const [date, setDate] = useState(new Date())
    const editor = React.createRef<HTMLInputElement>()
    return (
        <ThemeProvider theme={themes[props.theme]}>
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
                    <DailyTitle>{format(date, 'EEEE do MMMM yyyy')}</DailyTitle>
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
                        id="c25ce4ec-a6ae-46c1-9c58-25b51ff08e93"
                        isFilterable={true}
                        listName="Overdue"
                        filter="overdue(dueDate) or overdue(scheduledDate)"
                        renderingStrategy={RenderingStrategy.All}
                        noIndentOnSubtasks={true}
                    />
                </Section>
                <Section>
                    <FilteredItemList
                        id="d94b620e-e298-4a39-a04f-7f0ff47cfdb3"
                        showProject={true}
                        isFilterable={true}
                        listName="Due Today"
                        filter="today(dueDate)"
                        renderingStrategy={RenderingStrategy.All}
                    />
                    <FilteredItemList
                        id="a4e1c649-378f-4d14-9aac-2d2720270dd8"
                        showProject={true}
                        isFilterable={true}
                        listName="Scheduled Today"
                        filter="today(scheduledDate)"
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
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    setDailyGoal: (day, text) => {
        dispatch(setDailyGoal(day, text))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda)
