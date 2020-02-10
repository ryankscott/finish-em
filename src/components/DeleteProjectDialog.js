import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import InlineDialog from "./InlineDialog";

import { Header2, Paragraph } from "./Typography";
import { theme } from "../theme";
import Button from "./Button";

const BodyContainer = styled.div`
display: flex;
flex-direction column;
margin: 0px;
padding: 5px;
margin-bottom: 10px;
`;

// TODO:Manually positioning this is stupid
const Container = styled.div`
  position: relative;
  top: 130px;
  right: 420px;
`;

class DeleteProjectDialog extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {}

  render() {
    return (
      <ThemeProvider theme={theme}>
        <InlineDialog
          onClose={() => this.props.closeCreateProjectDialog()}
          placement={"bottom-start"}
          isOpen={this.props.visible}
          content={
            <div>
              <Header2>Delete Project</Header2>
              <BodyContainer>
                <Paragraph>
                  Are you sure you want to delete this project?
                </Paragraph>
              </BodyContainer>
              <Button type="error" compact onClick={() => console.log("here1")}>
                Yes
              </Button>
              <Button
                type="primary"
                compact
                onClick={() => console.log("here2")}
              >
                No
              </Button>
            </div>
          }
        >
          <Button type="primary" onClick={console.log("click")} compact>
            Delete
          </Button>
        </InlineDialog>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteProjectDialog);
