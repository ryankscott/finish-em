import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { format, sub, add } from 'date-fns'
import { connect } from 'react-redux'
import uuidv4 from 'uuid'
import { themes } from '../theme'
import FilteredItemList from '../containers/FilteredItemList'
import { Paragraph, Header1 } from './Typography'
import EditableText from './EditableText'
import { setDailyGoal, addComponent } from '../actions'
import { ItemType, RenderingStrategy, MainComponents, Component } from '../interfaces'
import {
    AgendaContainer,
    DateContainer,
    Section,
    BackContainer,
    ForwardContainer,
    DailyTitle,
} from './styled/DailyAgenda'
import Button from './Button'
import ReorderableComponentList from './ReorderableComponentList'

interface StateProps {
    dailyGoal: any[]
    items: ItemType[]
    theme: string
    components: MainComponents
}
interface DispatchProps {
    setDailyGoal: (day: string, input: string) => void
    addList: (id: string, viewId: Uuid) => void
}
type DailyAgendaProps = StateProps & DispatchProps

const DailyAgenda = (props: DailyAgendaProps): ReactElement => {
    const viewId = 'ccf4ccf9-28ff-46cb-9f75-bd3f8cd26134'
    const [currentDate, setDate] = useState(new Date())
    const editor = React.useRef<HTMLInputElement>()
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
                                setDate(sub(currentDate, { days: 1 }))
                            }}
                        />
                    </BackContainer>
                    <DailyTitle>{format(currentDate, 'EEEE do MMMM yyyy')}</DailyTitle>
                    <ForwardContainer>
                        <Button
                            spacing="compact"
                            type="default"
                            icon="forward"
                            onClick={() => {
                                setDate(add(currentDate, { days: 1 }))
                            }}
                        />
                    </ForwardContainer>
                    <Paragraph style={{ gridArea: 'week_of_year' }}>
                        Week of year: {format(currentDate, 'w')} / 52
                    </Paragraph>
                    <Paragraph style={{ gridArea: 'week_of_quarter' }}>
                        Week of quarter: {parseInt(format(currentDate, 'w')) % 13} / 13
                    </Paragraph>
                </DateContainer>
                <Header1> Daily Goal </Header1>
                <EditableText
                    style={Paragraph}
                    readOnly={false}
                    input={
                        props.dailyGoal[format(currentDate, 'yyyy-MM-dd')]
                            ? props.dailyGoal[format(currentDate, 'yyyy-MM-dd')].text
                            : 'No daily goal set'
                    }
                    height={'150px'}
                    singleline={false}
                    innerRef={editor}
                    onUpdate={(input) => {
                        props.setDailyGoal(format(currentDate, 'yyyy-MM-dd'), input)
                    }}
                    validation={false}
                    shouldSubmitOnBlur={true}
                    shouldClearOnSubmit={false}
                />
                <ReorderableComponentList id={viewId} />
                <Section>
                    <FilteredItemList
                        id="d94b620e-e298-4a39-a04f-7f0ff47cfdb3"
                        showProject={true}
                        isFilterable={true}
                        listName="Due Today"
                        filter={`sameDay(dueDate, "${currentDate.toISOString()}")`}
                        renderingStrategy={RenderingStrategy.All}
                        readOnly={true}
                    />
                    <FilteredItemList
                        id="a4e1c649-378f-4d14-9aac-2d2720270dd8"
                        showProject={true}
                        isFilterable={true}
                        listName="Scheduled Today"
                        filter={`sameDay(scheduledDate, "${currentDate.toISOString()}")`}
                        renderingStrategy={RenderingStrategy.All}
                        readOnly={true}
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
    components: state.ui.components,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    setDailyGoal: (day, text) => {
        dispatch(setDailyGoal(day, text))
    },
    addList: (viewId, location) => {
        const id = uuidv4()
        const component: Component = {
            name: 'FilteredItemList',
            props: {
                id: id,
                filter: 'not deleted',
                hideIcons: [],
                listName: 'New list',
                isFilterable: true,
            },
        }
        dispatch(addComponent(id, viewId, location, component))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda)
