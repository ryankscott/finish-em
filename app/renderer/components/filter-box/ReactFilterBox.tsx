import React, { ReactElement } from 'react'
import FilterInput from './FilterInput'
import GridDataAutoCompleteHandler, { Option } from './GridDataAutoCompleteHandler'
import Expression from './Expression'
import FilterQueryParser from './FilterQueryParser'
import ParsedError from './ParsedError'
import validateQuery, { ValidationResult } from './validateQuery'
import { useState } from 'react'
import { Completion, HintResult } from './models/ExtendedCodeMirror'
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler'
import { Flex } from '@chakra-ui/react'

type ReactFilterBoxProps = {
  onParseOk: (query: string, result: Expression[] | ParsedError) => void
  onParseError: (
    query: string,
    result: Expression[] | ParsedError,
    error?: ValidationResult,
  ) => void
  onChange: (
    query: string,
    result: Expression[] | ParsedError,
    validationResult: ValidationResult,
  ) => void
  customRenderCompletionItem: (
    self: HintResult,
    data: Completion,
    registerAndGetPickFunc: Function,
  ) => ReactElement
  autoCompleteHandler: BaseAutoCompleteHandler
  onBlur?: () => {}
  onFocus?: () => {}
  editorConfig?: {}
  strictMode: boolean
  query: string
  data?: any[]
  options?: Option[]
}

const ReactFilterBox = (props: ReactFilterBoxProps): ReactElement => {
  const [isFocus, setIsFocus] = useState(false)
  const [isError, setIsError] = useState(false)

  const parser = new FilterQueryParser()
  const autoCompleteHandler =
    props.autoCompleteHandler || new GridDataAutoCompleteHandler(props.data, props.options)

  parser.setAutoCompleteHandler(autoCompleteHandler)

  const needAutoCompleteValues = (codeMirror: any, text: string) => {
    return parser.getSuggestions(text)
  }

  const onSubmit = (query: string) => {
    var result = parser.parse(query)
    if ((result as ParsedError).isError) {
      return props.onParseError(query, result, { isValid: true })
    } else if (props.strictMode) {
      const validationResult = validateQuery(result as Expression[], parser.autoCompleteHandler)
      if (!validationResult.isValid) {
        return props.onParseError(query, result, validationResult)
      }
    }

    return props.onParseOk(query, result)
  }

  const onChange = (query: string) => {
    console.log('on change')
    var validationResult = { isValid: true }
    var result = parser.parse(query)
    if ((result as ParsedError).isError) {
      setIsError(true)
    } else if (props.strictMode) {
      validationResult = validateQuery(result as Expression[], parser.autoCompleteHandler)
      setIsError(!validationResult.isValid)
    } else {
      setIsError(false)
    }

    props.onChange(query, result, validationResult)
  }

  const onBlur = () => {
    setIsFocus(false)
  }

  const onFocus = () => {
    setIsFocus(true)
  }
  return (
    <Flex
      alignItems={'center'}
      overflowY={'scroll'}
      h={'auto'}
      p={0}
      m={0}
      fontSize={'sm'}
      color={'gray.800'}
      verticalAlign={'middle'}
      borderRadius={5}
      bg="gray.50"
      border={'1px solid'}
      borderColor={isError ? 'red.400' : 'gray.200'}
      transition={'border linear 0.2s, box-shadow linear 0.2s'}
      _hover={{
        bg: 'gray.100',
      }}
    >
      <FilterInput
        customRenderCompletionItem={props.customRenderCompletionItem}
        onBlur={onBlur}
        onFocus={onFocus}
        value={props.query}
        needAutoCompleteValues={needAutoCompleteValues}
        onSubmit={onSubmit}
        onChange={onChange}
        editorConfig={props.editorConfig}
      />
    </Flex>
  )
}

export default ReactFilterBox
