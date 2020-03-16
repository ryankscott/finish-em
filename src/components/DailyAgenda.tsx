import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import { Paragraph, Title, Header1 } from "./Typography";
import EditableText from "./EditableText";
import { setDailyGoal } from "../actions";

const DateContainer = styled.div`
  display: grid;
  grid-template-rows: 4fr 1fr;
  grid-template-areas:
    "day day day day"
    "week_of_year . . week_of_quarter";
  margin-bottom: 10px;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
  width: 100%;
`;

const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
  width: 100%;
  align-items: center;
  width: 675px;
`;

// TODO: Update with item prop
export interface DailyAgendaProps {
  setDailyGoal: (day: string, input: string) => void;
  items: Object[];
}

function DailyAgenda(props: DailyAgendaProps) {
  const day = format(new Date(), "yyyy-MM-dd");
  return (
    <ThemeProvider theme={theme}>
      <AgendaContainer>
        <DateContainer>
          <Title style={{ gridArea: "day" }}>
            {format(new Date(), "EEEE do MMMM yyyy")}
          </Title>
          <Paragraph style={{ gridArea: "week_of_year" }}>
            Week of year: {format(new Date(), "w")} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: "week_of_quarter" }}>
            Week of quarter: {format(new Date(), "w") % 13} / 13
          </Paragraph>
        </DateContainer>
        {/* <Header1> Weekly Goal </Header1> */}
        {/* <Paragraph> */}
        {/*   {props.weeklyGoal[week] */}
        {/*     ? props.weeklyGoal[week] */}
        {/*     : "No weekly goal set"} */}
        {/* </Paragraph> */}
        <Header1> Daily Goal </Header1>
        <EditableText
          onUpdate={input => {
            props.setDailyGoal(day, input);
          }}
          input={
            props.dailyGoal[day]
              ? props.dailyGoal[day].text
              : "No daily goal set"
          }
          height="150px"
        />
        <Section>
          <FilteredItemList
            items={props.items}
            filter="SHOW_OVERDUE"
            sortCriteria="DUE"
            showProject={true}
            listName="Overdue"
          />
        </Section>
        <Section>
          <FilteredItemList
            items={props.items}
            filter="SHOW_DUE_ON_DAY"
            params={{ dueDate: new Date() }}
            sortCriteria="DUE"
            showProject={true}
            listName="Due Today"
          />
          <FilteredItemList
            items={props.items}
            filter="SHOW_SCHEDULED_ON_DAY"
            params={{ scheduledDate: new Date() }}
            sortCriteria="STATUS"
            showProject={true}
            listName="Scheduled Today"
          />
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  items: state.items,
  dailyGoal: state.dailyGoal
});
const mapDispatchToProps = dispatch => ({
  setDailyGoal: (day, text) => {
    dispatch(setDailyGoal(day, text));
  }
});
export default connect(mapStateToProps, mapDispatchToProps)(DailyAgenda);
