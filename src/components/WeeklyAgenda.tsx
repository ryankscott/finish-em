import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { connect } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { themes } from '../theme'
import FilteredItemList from './FilteredItemList'
import { Paragraph } from './Typography'
import { getWeek, format, startOfWeek, sub, add } from 'date-fns'
import { ItemType, RenderingStrategy, MainComponents } from '../interfaces'
import {
  AgendaContainer,
  WeekContainer,
  Section,
  BackContainer,
  ForwardContainer,
  WeeklyTitle,
} from './styled/WeeklyAgenda'
import Button from './Button'
import { formatRelativeDate } from '../utils'
import { ItemIcons } from '../interfaces/item'

interface StateProps {
  items: ItemType[]
  theme: string
  components: MainComponents
  features: FeatureType
}
interface DispatchProps {}
type WeeklyAgendaProps = StateProps & DispatchProps

const WeeklyAgenda = (props: WeeklyAgendaProps): ReactElement => {
  const viewId = uuidv4()
  const [currentWeek, setWeek] = useState(getWeek(new Date()))
  const firstDayOfWeek = startOfWeek(new Date(), { weekStartsOn: 1 })
  return (
    <ThemeProvider theme={themes[props.theme]}>
      <AgendaContainer>
        <WeekContainer>
          <BackContainer>
            <Button
              spacing="compact"
              type="default"
              icon="back"
              onClick={() => {
                setWeek(currentWeek - 1)
              }}
            />
          </BackContainer>
          <WeeklyTitle>Week starting {format(firstDayOfWeek, 'EEEE do MMMM yyyy')}</WeeklyTitle>
          <ForwardContainer>
            <Button
              spacing="compact"
              type="default"
              icon="forward"
              onClick={() => {
                setWeek(currentWeek + 1)
              }}
            />
          </ForwardContainer>
          <Paragraph style={{ gridArea: 'week_of_year' }}>
            Week of year: {currentWeek} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: 'week_of_quarter' }}>
            Week of quarter: {currentWeek % 13} / 13
          </Paragraph>
        </WeekContainer>
        <Section>
          {Array.from({ length: 5 }, (val, idx) => {
            return (
              <div>
                <FilteredItemList
                  id={idx}
                  key={idx}
                  showProject={true}
                  isFilterable={true}
                  listName={formatRelativeDate(add(firstDayOfWeek, { days: idx }))}
                  filter={`sameDay(dueDate, "${add(firstDayOfWeek, { days: idx }).toISOString()}")`}
                  renderingStrategy={RenderingStrategy.All}
                  readOnly={true}
                  hideIcons={[ItemIcons.Due, ItemIcons.Scheduled, ItemIcons.Project]}
                  initiallyExpanded={true}
                />
              </div>
            )
          })}
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  items: state.items,
  theme: state.ui.theme,
  components: state.ui.components,
  features: state.features,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({})
export default connect(mapStateToProps, mapDispatchToProps)(WeeklyAgenda)
