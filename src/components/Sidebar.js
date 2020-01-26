import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { format } from "date-fns";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { theme } from "../theme";
import FilteredItemList from "../containers/FilteredItemList";
import QuickAdd from "./QuickAdd";
import { Header, SubTitle } from "./Typography";

const Container = styled.div`
  background-color: ${props => props.theme.colours.alternativeBackgroundColour};
  padding: 20px;
  height: 100%;
  width: 250px;
  display: flex;
  flex-direction: column;
`;

const StyledLink = styled(Link)`
  font-size: ${props => props.theme.fontSizes.large};
  font-weight: ${props => props.theme.fontWeights.regular};
  color: ${props => props.theme.colours.altTextColour};
  text-decoration: none;
  margin: 5px 0px 5px 10px;
`;

class Sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Header invert> Views </Header>
          <StyledLink to="/inbox"> Inbox </StyledLink>
          <StyledLink to="/dailyAgenda"> Daily Agenda </StyledLink>
          <Header invert> Projects </Header>
          {this.props.projects.map(p => {
            const pathName = "/projects/" + p.id;
            if (p.id != null) {
              return (
                <StyledLink key={p.id} to={pathName}>
                  {p.name}
                </StyledLink>
              );
            }
          })}
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  projects: state.projects
});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Sidebar);
