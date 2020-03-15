import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import Select from "react-select";
import { theme } from "../theme";
import { format } from "date-fns";
import { RRule } from "rrule";

import { connect } from "react-redux";
const customStyles = {
  input: () => ({
    padding: "5px",
    fontFamily: theme.font.sansSerif
  }),
  menu: (provided, state) => ({
    margin: "4px 0px 0px 0px",
    padding: "0px",
    border: "1px solid",
    backgroundColor: theme.colours.backgroundColour,
    borderColor: theme.colours.borderColour,
    tabIndex: 0
  }),
  option: (provided, state) => ({
    ...provided,
    tabIndex: 0,
    color: theme.colours.defaultTextColour,
    backgroundColor: state.isFocused
      ? theme.colours.focusBackgroundColour
      : "white",
    padding: "5px 10px",
    margin: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small,
    fontWeight: state.isFocused
      ? theme.fontWeights.bold
      : theme.fontWeights.regular
  }),
  control: () => ({
    width: "100%",
    margin: 0,
    padding: 0,
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small
  }),
  singleValue: (provided, state) => ({}),
  indicatorsContainer: () => ({ display: "none" }),
  dropdownIndicator: () => ({
    display: "none"
  }),
  noOptionsMessage: () => ({
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.xsmall,
    fontWeight: theme.fontWeights.thin,
    padding: "2px 5px"
  })
};

const Container = styled.div`
  position: inline;
  box-styling: border-box;
  display: flex;
  flex-direction: column;
  border: 1px solid;
  border-color: ${props => props.theme.colours.borderColour};
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

class RepeatPicker extends Component {
  constructor(props) {
    super(props);
    this.state = { selectedOption: null, dayPickerVisible: false };
    this.handleChange = this.handleChange.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.focus();
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
            ref={ref => {
              this.selectRef = ref;
            }}
            tabIndex={0}
            autoFocus={true}
            placeholder={this.props.placeholder}
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={options}
            styles={customStyles}
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
