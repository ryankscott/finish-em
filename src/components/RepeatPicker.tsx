import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import Select from "react-select";
import { theme, selectStyles } from "../theme";
import { format } from "date-fns";
import { RRule } from "rrule";

import { connect } from "react-redux";

interface ContainerProps {
  visible: boolean;
}
const Container = styled.div<ContainerProps>`
  position: inline;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 35px;
  padding: 0px;
  display: ${props => (!props.visible ? "none" : null)};
  background-color: #fff;
  width: 250px;
`;

const options = [
  {
    value: new RRule({
      freq: RRule.DAILY,
      interval: 1
    }),
    label: "Daily"
  },
  {
    value: new RRule({
      freq: RRule.DAILY,
      interval: 1,
      byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR]
    }),
    label: "Weekdays"
  },
  {
    value: new RRule({
      freq: RRule.WEEKLY,
      interval: 1
    }),
    label: "Weekly on " + format(new Date(), "EEE")
  },
  {
    value: new RRule({
      freq: RRule.MONTHLY,
      interval: 1
    }),
    label: "Monthly on the " + format(new Date(), "do")
  },

  { value: null, label: "None" }
];

interface RepeatPickerProps {
  visible: boolean;
  onSubmit: (value: string) => void;
  placeholder: string;
}
interface RepeatPickerState {
  selectedOption: {};
  dayPickerVisible: boolean;
}

class RepeatPicker extends Component<RepeatPickerProps, RepeatPickerState> {
  private selectRef: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.state = { selectedOption: null, dayPickerVisible: false };
    this.handleChange = this.handleChange.bind(this);
    this.selectRef = React.createRef();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.current.focus();
    }
  }

  handleChange(newValue, actionMeta) {
    if (actionMeta.action == "select-option") {
      this.props.onSubmit(newValue.value);
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container visible={this.props.visible}>
          <Select
            ref={this.selectRef}
            tabIndex={0}
            autoFocus
            placeholder={this.props.placeholder}
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={options}
            styles={selectStyles}
            defaultMenuIsOpen={true}
          />
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(RepeatPicker);
