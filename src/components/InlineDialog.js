import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { connect } from "react-redux";
import { Manager, Reference, Popper } from "react-popper";

import { theme } from "../theme";
import IconButton from "./IconButton";
// TODO: IconButton is shit

const Container = styled.div`
  position: relative;
  box-sizing: border-box;
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: column;
  width: 200px;
  background-color: ${props => props.theme.colours.lightDialogBackgroundColour};
  z-index: 2;
  padding: 5px 5px 8px 5px;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: end;
  width: 100%;
  margin: 0px;
  padding: 0px;
`;

const BodyContainer = styled.div`
  margin: 0px;
  padding: 5px;
`;

class InlineDialog extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Manager>
        <Reference>
          {({ ref }) => <div ref={ref}>{this.props.children}</div>}
        </Reference>
        <Popper placement={this.props.placement}>
          {({ ref, style, placement, arrowProps }) => (
            <div ref={ref} style={style} data-placement={this.props.placement}>
              <ThemeProvider theme={theme}>
                <Container visible={this.props.isOpen}>
                  <HeaderContainer>
                    <IconButton onClick={this.props.onClose}>×</IconButton>
                  </HeaderContainer>
                  <BodyContainer>{this.props.content}</BodyContainer>
                </Container>
              </ThemeProvider>

              <div ref={arrowProps.ref} style={arrowProps.style} />
            </div>
          )}
        </Popper>
      </Manager>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InlineDialog);
