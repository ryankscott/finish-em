import React, { ReactElement } from "react";
import { Button } from "./Button";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
interface ContainerProps {
  visible: boolean;
  completed: boolean;
  type: "due" | "repeat" | "scheduled";
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
  type: "due" | "repeat" | "scheduled";
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
          <Button
            type="default"
            spacing="compact"
            onClick={() => {}}
            icon={props.type}
          >
            {props.text}
          </Button>
        </SubTextContainer>
      </Container>
    </ThemeProvider>
  );
};
export default DateRenderer;
