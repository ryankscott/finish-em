import React, { Component } from "react";
import styled, { ThemeProvider, StyledFunction } from "styled-components";
import Select from "react-select";
import { theme } from "../theme";
import { add, lastDayOfWeek } from "date-fns";
import "./DatePicker.css";
import DayPicker from "react-day-picker/DayPicker";

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

interface ContainerProps {
  visible: boolean;
}
const Container = styled.div<ContainerProps>`
  position: inline;
  box-sizing: border-box;
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
  { value: new Date(), label: "Today" },
  {
    value: add(new Date(), { days: 1 }),
    label: "Tomorrow"
  },
  {
    value: add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), { days: 1 }),
    label: "Next Week"
  },
  {
    value: null,
    label: "Custom date"
  },
  { value: null, label: "No date" }
];

export interface DatePickerProps {
  visible: boolean;
  onSubmit: (Date) => void;
  placeholder: string;
}
interface DatePickerState {
  selectedOption: boolean;
  dayPickerVisible: boolean;
}
class DatePicker extends Component<DatePickerProps, DatePickerState> {
  private selectRef: React.RefObject<HTMLInputElement>;
  constructor(props) {
    super(props);
    this.state = { selectedOption: null, dayPickerVisible: false };
    this.handleChange = this.handleChange.bind(this);
    this.handleDayClick = this.handleDayClick.bind(this);
    this.selectRef = React.createRef();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.visible !== this.props.visible && this.props.visible) {
      this.selectRef.current.focus();
    }
  }

  handleChange(newValue, actionMeta) {
    if (actionMeta.action == "select-option") {
      // if it's a custom date then show the calendar item
      if (newValue.label == "Custom date") {
        this.setState({
          dayPickerVisible: true
        });
        return;
      }
      this.props.onSubmit(newValue.value);
    }
  }

  handleDayClick(day, modifiers, e) {
    this.setState({
      dayPickerVisible: false
    });
    this.props.onSubmit(day);
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container visible={this.props.visible}>
          <Select
            ref={this.selectRef}
            tabIndex={0}
            placeholder={this.props.placeholder}
            value={this.state.selectedOption}
            onChange={this.handleChange}
            options={options}
            styles={customStyles}
            defaultMenuIsOpen={true}
            autoFocus
          />
          {this.state.dayPickerVisible && (
            <DayPicker tabIndex={0} onDayClick={this.handleDayClick} />
          )}
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(mapStateToProps, mapDispatchToProps)(DatePicker);