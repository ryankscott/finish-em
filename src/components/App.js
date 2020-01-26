import React, { Component } from "react";
import QuickAdd from "./QuickAdd";
import FilteredItemList from "../containers/FilteredItemList";
import ProjectList from "../containers/ProjectList";
import DailyAgenda from "../components/DailyAgenda";
import Inbox from "../components/Inbox";
import Project from "../components/Project";
import Sidebar from "../components/Sidebar";
import { connect } from "react-redux";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { theme } from "../theme";
import { Route, Switch, useParams } from "react-router-dom";

const GlobalStyle = createGlobalStyle`
  body {
    font-family: ${props => props.theme.font.sansSerif};
    color: ${props => props.theme.colours.defaultTextColour};
    font-weight: ${props => props.theme.fontWeights.regular};
    background-color: ${props => props.theme.colours.backgroundColour};
    box-sizing: border-box;
    padding: 0px;
    margin: 0px;
  }
  input:focus {
    outline:none;
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0px;
  height: 100%;
  position: fixed;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
`;

const ProjectWrapper = () => {
  let { id } = useParams();
  return <Project projectId={id} />;
};

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Container>
          <Sidebar />
          <MainContainer>
            <Switch>
              <Route exact path="/" component={Inbox} />
              <Route exact path="/inbox" component={Inbox} />
              <Route exact path="/dailyAgenda" component={DailyAgenda} />
              <Route path="/projects/:id" children={<ProjectWrapper />} />
            </Switch>
          </MainContainer>
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);
