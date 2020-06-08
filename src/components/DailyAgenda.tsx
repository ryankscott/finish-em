import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { format, sub, add } from 'date-fns'
import { connect } from 'react-redux'
import { themes } from '../theme'
import FilteredItemList from '../containers/FilteredItemList'
import { useHistory } from 'react-router-dom'
import { Paragraph, Header1 } from './Typography'
import EditableText from './EditableText'
import { setDailyGoal } from '../actions'
import {
    ItemType,
    RenderingStrategy,
    Extensions,
    FilterEnum,
} from '../interfaces'
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
    extensions: Extensions
}
interface DispatchProps {
    setDailyGoal: (day: string, input: string) => void
}
type DailyAgendaProps = StateProps & DispatchProps

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
    const [date, setDate] = useState(new Date())
    const editor = React.createRef<HTMLInputElement>()
    const history = useHistory()
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
                {props.extensions &&
                    Object.values(props.extensions).map((e) => {
                        if (e.path == history.location.pathname) {
                            if (e.location == 'main') {
                                switch (e.component.name) {
                                    case 'FilteredItemList':
                                        return (
                                            <Section key={e.id}>
                                                <FilteredItemList
                                                    {...e.component.props}
                                                />
                                            </Section>
                                        )
                                        break
                                    default:
                                        break
                                }
                            }
                        }
                    })}
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
    theme: state.ui.theme,
    extensions: state.extensions,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    setDailyGoal: (day, text) => {
        dispatch(setDailyGoal(day, text))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda)
