import { ReactElement, useState } from 'react';
import { Flex } from '@chakra-ui/react';
import FilterInput from './FilterInput';
import GridDataAutoCompleteHandler, {
  Option,
} from './GridDataAutoCompleteHandler';
import Expression from './Expression';
import FilterQueryParser from './FilterQueryParser';
import ParsedError from './ParsedError';
import validateQuery, { ValidationResult } from './validateQuery';
import {
  Completion,
  ExtendedCodeMirror,
  HintResult,
} from './models/ExtendedCodeMirror';
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler';

type ReactFilterBoxProps = {
  onParseOk: (query: string, result: Expression[] | ParsedError) => void;
  onParseError: (
    query: string,
    result: Expression[] | ParsedError,
    error?: ValidationResult
  ) => void;
  onChange: (
    query: string,
    result: Expression[] | ParsedError,
    validationResult: ValidationResult
  ) => void;
  customRenderCompletionItem: (
    self: HintResult,
    data: Completion,
    registerAndGetPickFunc: Function
  ) => ReactElement;
  autoCompleteHandler: BaseAutoCompleteHandler;
  onBlur?: () => void;
  onFocus?: () => void;
  editorConfig?: {};
  strictMode: boolean;
  query: string;
  data?: any[];
  options?: Option[];
};

const ReactFilterBox = ({
  onChange,
  onParseError,
  customRenderCompletionItem,
  onParseOk,
  onBlur,
  onFocus,
  options,
  autoCompleteHandler,
  editorConfig,
  query,
  strictMode,
  data,
}: ReactFilterBoxProps): ReactElement => {
  const [isFocus, setIsFocus] = useState(false);
  const [isError, setIsError] = useState(false);

  const parser = new FilterQueryParser();
  const ach =
    autoCompleteHandler || new GridDataAutoCompleteHandler(data, options);

  parser.setAutoCompleteHandler(ach);

  const needAutoCompleteValues = (
    codemirror: ExtendedCodeMirror,
    text: string
  ) => {
    return parser.getSuggestions(text);
  };

  const onSubmit = (query: string) => {
    const result = parser.parse(query);
    if ((result as ParsedError).isError) {
      return onParseError(query, result, { isValid: true });
    }
    if (strictMode) {
      const validationResult = validateQuery(
        result as Expression[],
        parser.autoCompleteHandler
      );
      if (!validationResult.isValid) {
        return onParseError(query, result, validationResult);
      }
    }

    return onParseOk(query, result);
  };

  const onLocalChange = (query: string) => {
    let validationResult = { isValid: true };
    const result = parser.parse(query);
    if ((result as ParsedError).isError) {
      setIsError(true);
    } else if (strictMode) {
      validationResult = validateQuery(
        result as Expression[],
        parser.autoCompleteHandler
      );
      setIsError(!validationResult.isValid);
    } else {
      setIsError(false);
    }

    onChange(query, result, validationResult);
  };

  const onLocalBlur = () => {
    setIsFocus(false);
  };

  const onLocalFocus = () => {
    setIsFocus(true);
  };

  return (
    <Flex
      alignItems="center"
      overflowY="scroll"
      h="auto"
      p={0}
      m={0}
      fontSize="sm"
      color="gray.800"
      verticalAlign="middle"
      borderRadius="md"
      bg="gray.50"
      border="1px solid"
      borderColor={isError ? 'red.400' : 'gray.200'}
      transition="border linear 0.2s, box-shadow linear 0.2s"
      _hover={{
        bg: 'gray.100',
      }}
    >
      <FilterInput
        customRenderCompletionItem={customRenderCompletionItem}
        onBlur={onLocalBlur}
        onFocus={onLocalFocus}
        value={query}
        needAutoCompleteValues={needAutoCompleteValues}
        onSubmit={onSubmit}
        onChange={onLocalChange}
        editorConfig={editorConfig}
      />
    </Flex>
  );
};

export default ReactFilterBox;
