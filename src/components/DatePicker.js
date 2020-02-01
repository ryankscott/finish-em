import React, { Component } from "react";
import styled, { ThemeProvider } from "styled-components";
import Select from "react-select";
import { format } from "date-fns";
import { connect } from "react-redux";
import moment from "moment";

import { theme } from "../theme";
import "./DatePicker.css";
import DayPickerInput from "react-day-picker/DayPickerInput";

// const CustomOverlay = ({ classNames, selectedDay, children, ...props }) => {
//   return (
//     <div style={{}} {...props}>
//       <div className={classNames.overlay}>{children}</div>
//     </div>
//   );
// };

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  font-family: ${props => props.theme.font.sansSerif};
  border-color: ${props => props.theme.colours.borderColour};
  display: ${props => (!props.visible ? "none" : null)};
  z-index: 1;
  background-color: #fff;
  margin-left: 10px;
`;

class DatePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDay: undefined,
      isEmpty: true
    };
    this.handleDayChange = this.handleDayChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  handleDayChange(selectedDay, modifiers, dayPickerInput) {
    const input = dayPickerInput.getInput();
    this.setState({
      selectedDay,
      isEmpty: !input.value.trim()
    });
  }

  handleKeyDown(e) {
    const { selectedDay, isEmpty } = this.state;
    if (e.key == "Enter") {
      selectedDay && !isEmpty ? this.props.onSubmit(selectedDay) : null;
    }
    if (e.key == "Escape") {
      this.props.close();
    }
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Container visible={this.props.visible}>
          <DayPickerInput
            showWeekNumbers
            value={this.state.selectedDay}
            onDayChange={this.handleDayChange}
            placeholder={this.props.placeholder + " yyyy-mm-dd"}
            inputProps={{
              onKeyDown: e => {
                this.handleKeyDown(e);
              }
            }}
          />
        </Container>
      </ThemeProvider>
    );
  }
}

const mapStateToProps = state => ({});
const mapDispatchToProps = dispatch => ({});
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DatePicker);
