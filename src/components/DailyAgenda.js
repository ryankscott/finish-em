import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import { Header, Title, SubTitle } from "./Typography";

const DateContainer = styled.div`
  display: grid;
  grid-template-rows: 100%;
  grid-template-columns: 12fr 4fr 4fr;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
`;

const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
`;

class DailyAgenda extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const today = new Date();
    return (
      <ThemeProvider theme={theme}>
        <AgendaContainer>
          <DateContainer>
            <Header>{format(today, "EEEE do MMMM yyyy")}</Header>
            <SubTitle>Week of year: {format(today, "w")} / 52</SubTitle>
            <SubTitle>Week of quarter: {format(today, "w") % 13} / 13</SubTitle>
          </DateContainer>

          <Section>
            <SubTitle> Overdue </SubTitle>
            <FilteredItemList items={this.props.items} filter="SHOW_OVERDUE" />
          </Section>

          <Section>
            <SubTitle> Scheduled Today </SubTitle>
            <FilteredItemList
              items={this.props.items}
              filter="SHOW_SCHEDULED_ON_DAY"
              params={{ scheduledDate: today }}
            />
          </Section>
        </AgendaContainer>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  items: state.items
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DailyAgenda);
