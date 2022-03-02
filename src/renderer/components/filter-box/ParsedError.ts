import * as PEG from 'pegjs'

interface ParsedError extends PEG.GrammarError {
  isError: boolean
}

export default ParsedError
