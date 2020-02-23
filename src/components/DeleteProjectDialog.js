import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import InlineDialog from "./InlineDialog";

import { Header2, Paragraph } from "./Typography";
import { theme } from "../theme";
import { Button } from "./Button";
import {
  deleteProject,
  toggleDeleteProjectDialog,
  hideDeleteProjectDialog
} from "../actions";

const BodyContainer = styled.div`
display: flex;
flex-direction column;
margin: 0px;
padding: 5px;
margin-bottom: 10px;
`;

const Container = styled.div`
  position: relative;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: flex-end;
`;

class DeleteProjectDialog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <InlineDialog
          onClose={() => this.props.closeDeleteProjectDialog()}
          placement={"bottom-start"}
          isOpen={this.props.visible}
          onOpen={() => {}}
          content={
            <div>
              <Header2>Delete Project</Header2>
              <BodyContainer>
                <Paragraph>
                  Are you sure you want to delete this project?
                </Paragraph>
              </BodyContainer>
              <ActionContainer>
                <Button type="error" compact onClick={this.props.onDelete}>
                  Yes
                </Button>
                <Button
                  type="primary"
                  compact
                  autoFocus
                  onClick={() => this.props.closeDeleteProjectDialog()}
                >
                  No
                </Button>
              </ActionContainer>
            </div>
          }
        >
          <Button
            type="primary"
            onClick={() => this.props.toggleDeleteProjectDialog()}
            compact
          >
            Delete
          </Button>
        </InlineDialog>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  visible: state.ui.deleteProjectDialogVisible
});

const mapDispatchToProps = dispatch => ({
  closeDeleteProjectDialog: () => {
    dispatch(hideDeleteProjectDialog());
  },
  toggleDeleteProjectDialog: () => {
    dispatch(toggleDeleteProjectDialog());
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteProjectDialog);
