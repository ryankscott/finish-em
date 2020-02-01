import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import { Paragraph, Header, Title, SubTitle } from "./Typography";

const DateContainer = styled.div`
  display: grid;
  grid-template-rows: 4fr 1fr;
  grid-template-areas:
    "day day day day"
    "week_of_year . . week_of_quarter";
  align-items: end;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
  width: 100%;
`;

function DailyAgenda(props) {
  return (
    <ThemeProvider theme={theme}>
      <AgendaContainer>
        <DateContainer>
          <Header style={{ gridArea: "day" }}>
            {format(new Date(), "EEEE do MMMM yyyy")}
          </Header>
          <Paragraph style={{ gridArea: "week_of_year" }}>
            Week of year: {format(new Date(), "w")} / 52
          </Paragraph>
          <Paragraph style={{ gridArea: "week_of_quarter" }}>
            Week of quarter: {format(new Date(), "w") % 13} / 13
          </Paragraph>
        </DateContainer>

        <Section>
          <SubTitle> Overdue </SubTitle>
          <FilteredItemList items={props.items} filter="SHOW_OVERDUE" />
        </Section>

        <Section>
          <SubTitle> Scheduled Today </SubTitle>
          <FilteredItemList
            items={props.items}
            filter="SHOW_SCHEDULED_ON_DAY"
            params={{ scheduledDate: new Date() }}
          />
        </Section>
      </AgendaContainer>
    </ThemeProvider>
  );
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DailyAgenda);
