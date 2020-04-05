import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import { Manager, Reference, Popper } from "react-popper";

import { theme } from "../theme";
import IconButton from "./IconButton";

// TODO: How to animate this without blocking other clicks display: none hides it but won't animate
interface ContainerProps {
  visible: boolean;
}
const Container = styled.div<ContainerProps>`
  position: absolute;
  box-sizing: border-box;
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: column;
  width: 200px;
  background-color: ${props => props.theme.colours.lightDialogBackgroundColour};
  padding: 5px 5px 8px 5px;
  justify-content: center;
  align-items: center;
  border-radius: 3px;
  margin: 2px;
  transition: all 0.1s ease-in-out;
  z-index: 99;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin: 0px;
  padding: 0px;
`;

const BodyContainer = styled.div`
  margin: 0px;
  padding: 5px;
`;

export interface InlineDialogProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  placement:
    | "auto"
    | "auto-start"
    | "auto-end"
    | "top"
    | "top-start"
    | "top-end"
    | "bottom"
    | "bottom-start"
    | "bottom-end"
    | "right"
    | "right-start"
    | "right-end"
    | "left"
    | "left-start"
    | "left-end";
  content: string;
}
interface InlineDialogState {}
class InlineDialog extends Component<InlineDialogProps, InlineDialogState> {
  private node: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.node = React.createRef();
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClick, false);
  }
  componentWillUnount() {
    document.removeEventListener("mousedown", this.handleClick, false);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.isOpen !== this.props.isOpen && this.props.isOpen) {
      this.props.onOpen();
    }
  }

  handleClick(e) {
    // Don't close if we're clicking on the dialog
    if (e && this.node.current && this.node.current.contains(e.target)) {
      return;
    }
    // Only close if it's currently open
    if (this.props.isOpen) {
      this.props.onClose();
    }
  }

  render() {
    return (
      <Manager>
        <Reference>
          {({ ref }) => <div ref={ref}>{this.props.children}</div>}
        </Reference>
        <Popper placement={this.props.placement}>
          {({ ref, style, arrowProps }) => (
            <div ref={ref} style={style} data-placement={this.props.placement}>
              <ThemeProvider theme={theme}>
                <Container ref={this.node} visible={this.props.isOpen}>
                  <HeaderContainer>
                    <IconButton
                      onClick={this.props.onClose}
                      visible={true}
                      icon="CLOSE"
                      coloured={true}
                    />
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

export default InlineDialog;
