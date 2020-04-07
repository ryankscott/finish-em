import React, { ReactElement } from "react";
import IconButton from "./IconButton";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
interface ContainerProps {
  visible: boolean;
  completed: boolean;
  type: "DUE" | "REPEAT" | "SCHEDULED";
}

const Container = styled.div<ContainerProps>`
  display: ${(props) => (props.visible ? "flex" : "none")};
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  color: ${(props) => props.theme.colours.defaultTextColour};
  border-radius: 5px;
  text-decoration: ${(props) =>
    props.completed == true ? "line-through" : null};
`;

interface SubTextProps {
  visible: boolean;
  position: "center" | "flex-end" | "flex-start";
}
const SubTextContainer = styled.div<SubTextProps>`
  display: ${(props) => (props.visible ? "flex" : "none")};
  flex-direction: row;
  align-items: center;
  justify-content: ${(props) => props.position};
  margin-left: ${(props) => (props.position == "flex-start" ? "32px" : "0px")};
`;

interface Props {
  visible: boolean;
  completed: boolean;
  position: "center" | "flex-end" | "flex-start";
  type: "DUE" | "REPEAT" | "SCHEDULED";
  text: string;
}

const DateRenderer = (props: Props): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Container
        completed={props.completed}
        type={props.type}
        visible={props.visible}
      >
        <SubTextContainer
          visible={props.visible}
          key={props.type}
          position={props.position}
        >
          <IconButton
            visible={props.visible}
            onClick={() => {}}
            icon={props.type}
            text={props.text}
          />
        </SubTextContainer>
      </Container>
    </ThemeProvider>
  );
};
export default DateRenderer;
