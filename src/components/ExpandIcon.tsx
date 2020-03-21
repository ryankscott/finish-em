import React, { ReactElement } from "react";
import styled from "styled-components";
import { expandedIcon, collapsedIcon } from "../assets/icons";

interface ContainerProps {
  visible: boolean;
}
const Container = styled.div<ContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  grid-area: collapse;
  justify-content: center;
  align-self: center;
`;

interface Props {
  onClick: () => void;
  visible: boolean;
  expanded: boolean;
}

// TODO: Maybe I should abstract this back to a generic IconButton

const ExpandIcon = (props: Props): ReactElement => {
  return (
    <Container visible={props.visible} onClick={props.onClick}>
      {props.expanded ? expandedIcon() : collapsedIcon()}
    </Container>
  );
};

export default ExpandIcon;
