import React, { ReactElement } from "react";
import IconButton from "./IconButton";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { formatRelativeDate } from "../utils";
import { RRule } from "rrule";
import { parseISO } from "date-fns/esm";
interface ContainerProps {
  visible: boolean;
  completed: boolean;
  type: "DUE" | "REPEAT" | "SCHEDULED";
}

const Container = styled.div<ContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  font-size: ${props => props.theme.fontSizes.xsmall};
  color: ${props => props.theme.colours.defaultTextColour};
  border-radius: 5px;
  text-decoration: ${props =>
    props.completed == true ? "line-through" : null};
`;

interface SubTextProps {
  visible: boolean;
  position: "center" | "flex-end" | "flex-start";
}
const SubTextContainer = styled.div<SubTextProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: row;
  align-items: center;
  justify-content: ${props => props.position};
  margin-left: ${props => (props.position == "flex-start" ? "32px" : "0px")};
`;

interface DefaultProps {
  visible: boolean;
  completed: boolean;
  position: "center" | "flex-end" | "flex-start";
  type: "DUE" | "REPEAT" | "SCHEDULED";
}
interface RepeatProps extends DefaultProps {
  repeat: RRule;
}

interface DateProps extends DefaultProps {
  date: Date;
}

type Props = RepeatProps | DateProps;

// TODO #21: Fix this nasty hack, somehow we sometimes get strings as dates
const resolveText = (date: Date, repeat: RRule): string => {
  return "";
  /*
  if (repeat == null || repeat == undefined) return "";
  if (typeof date == "string") {
    return formatRelativeDate(parseISO(date));
  }
  try {
    return repeat.toText();
  } catch (e) {
    console.log(e);
    console.log(repeat);
  }*/
};

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
            text={props.visible && resolveText(props.date, props.repeat)}
          />
        </SubTextContainer>
      </Container>
    </ThemeProvider>
  );
};
export default DateRenderer;
