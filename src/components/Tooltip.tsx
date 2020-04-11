import React from "react";
import { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import ReactTooltip from "react-tooltip";
import { Paragraph } from "./Typography";

interface TooltipProps {
  id: string;
  text: string;
}
export const Tooltip = (props: TooltipProps) => {
  console.log(props);
  return (
    <ThemeProvider theme={theme}>
      <ReactTooltip id={props.id} type="dark" effect="float" place="right">
        <Paragraph invert>{props.text}</Paragraph>
      </ReactTooltip>
    </ThemeProvider>
  );
};
