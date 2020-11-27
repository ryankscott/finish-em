import React from 'react'
import FilterInput from './FilterInput'
import SimpleResultProcessing from './SimpleResultProcessing'
import { connect } from 'react-redux'
import { ThemeProvider } from '../../StyledComponents'

import { themes } from '../../theme'
import GridDataAutoCompleteHandler, { Option } from './GridDataAutoCompleteHandler'
import Expression from './Expression'
import FilterQueryParser from './FilterQueryParser'
import BaseResultProcessing from './BaseResultProcessing'
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler'
import ParsedError from './ParsedError'
import validateQuery, { ValidationResult } from './validateQuery'
import { StyledFilterBox } from './styled/ReactFilterBox'

type StateProps = {
  theme: string
}

type OwnProps = {
  onParseOk: (query: string, result: Expression[] | ParsedError) => {}
  onParseError: (query: string, result: Expression[] | ParsedError, error: ValidationResult) => {}
  onChange: (
    query: string,
    result: Expression[] | ParsedError,
    validationResult: ValidationResult,
  ) => {}
  onDataFiltered: () => {}
  autoCompleteHandler: any
  onBlur: () => {}
  onFocus: () => {}
  editorConfig: {}
  strictMode: false
  query: string
  data: []
  options: []
}

type ReactFilterBoxState = {
  isFocus: boolean
  isError: boolean
}

type ReactFilterBoxProps = StateProps & OwnProps

export class ReactFilterBox extends React.Component<ReactFilterBoxProps, ReactFilterBoxState> {
  parser = new FilterQueryParser()

  constructor(props: any) {
    super(props)

    var autoCompleteHandler =
      this.props.autoCompleteHandler ||
      new GridDataAutoCompleteHandler(this.props.data, this.props.options)

    this.parser.setAutoCompleteHandler(autoCompleteHandler)

    this.state = {
      isFocus: false,
      isError: false,
    }
  }

  needAutoCompleteValues(codeMirror: any, text: string) {
    return this.parser.getSuggestions(text)
  }

  onSubmit(query: string) {
    var result = this.parser.parse(query)
    if ((result as ParsedError).isError) {
      return this.props.onParseError(result, { isValid: true })
    } else if (this.props.strictMode) {
      const validationResult = validateQuery(
        result as Expression[],
        this.parser.autoCompleteHandler,
      )
      if (!validationResult.isValid) {
        return this.props.onParseError(result, validationResult)
      }
    }

    return this.props.onParseOk(query, result)
  }

  onChange(query: string) {
    var validationResult = { isValid: true }
    var result = this.parser.parse(query)
    if ((result as ParsedError).isError) {
      this.setState({ isError: true })
    } else if (this.props.strictMode) {
      validationResult = validateQuery(result as Expression[], this.parser.autoCompleteHandler)
      this.setState({ isError: !validationResult.isValid })
    } else {
      this.setState({ isError: false })
    }

    this.props.onChange(query, result, validationResult)
  }

  onBlur() {
    this.setState({ isFocus: false })
  }

  onFocus() {
    this.setState({ isFocus: true })
  }

  render() {
    return (
      <ThemeProvider theme={themes[this.props.theme]}>
        <StyledFilterBox focus={this.state.isFocus} error={this.state.isError}>
          <FilterInput
            autoCompletePick={this.props.autoCompletePick}
            customRenderCompletionItem={this.props.customRenderCompletionItem}
            onBlur={this.onBlur.bind(this)}
            onFocus={this.onFocus.bind(this)}
            value={this.props.query}
            needAutoCompleteValues={this.needAutoCompleteValues.bind(this)}
            onSubmit={this.onSubmit.bind(this)}
            onChange={this.onChange.bind(this)}
            editorConfig={this.props.editorConfig}
          />
        </StyledFilterBox>
      </ThemeProvider>
    )
  }
}

export {
  SimpleResultProcessing,
  BaseResultProcessing,
  GridDataAutoCompleteHandler,
  BaseAutoCompleteHandler,
  Option as AutoCompleteOption,
  Expression,
}

const mapStateToProps = (state): StateProps => {
  return {
    theme: state.ui.theme,
  }
}

const mapDispatchToProps = (dispatch): DispatchProps => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ReactFilterBox)
