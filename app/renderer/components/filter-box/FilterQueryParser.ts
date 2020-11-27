import parser from './grammar.pegjs'
import * as PEG from 'pegjs'
import * as _ from 'lodash'
import BaseAutoCompleteHandler from './BaseAutoCompleteHandler'
import ParseTrace from './ParseTrace'
import grammarUtils from './GrammarUtils'
import { HintInfo } from './models/ExtendedCodeMirror'
import Expression from './Expression'
import ParsedError from './ParsedError'

export default class FilterQueryParser {
  autoCompleteHandler = new BaseAutoCompleteHandler()
  lastError: PEG.PegjsError = null

  parseTrace = new ParseTrace()
  constructor() {}

  parse(query: string): Expression[] | ParsedError {
    query = _.trim(query)
    if (_.isEmpty(query)) {
      return []
    }

    try {
      return this.parseQuery(query)
    } catch (ex) {
      ex.isError = true
      return ex
    }
  }

  private parseQuery(query: string) {
    this.parseTrace.clear()
    return parser.parse(query, { parseTrace: this.parseTrace })
  }

  getSuggestions(query: string): HintInfo[] {
    query = grammarUtils.stripEndWithNonSeparatorCharacters(query)
    try {
      this.parseQuery(query)
      console.log(this.parseTrace)
      if (!query || grammarUtils.isLastCharacterWhiteSpace(query)) {
        return _.map(['AND', 'OR'], (f) => {
          return { value: f, type: 'literal' }
        })
      }

      return []
    } catch (ex) {
      return this.autoCompleteHandler.handleParseError(parser, this.parseTrace, ex)
    }
  }

  setAutoCompleteHandler(autoCompleteHandler: BaseAutoCompleteHandler) {
    this.autoCompleteHandler = autoCompleteHandler
  }
}

export interface ExtendedParser extends PEG.Parser {}
