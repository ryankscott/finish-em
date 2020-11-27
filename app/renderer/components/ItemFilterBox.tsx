import React, { ReactElement, useState } from 'react'
import DatePicker from 'react-datepicker'
import { gql, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { Wrapper } from './styled/ReactDatePicker'
import { FilterContainer, Suggestion, Error } from './styled/ItemFilterBox'

import ReactFilterBox, {
  Expression,
  GridDataAutoCompleteHandler,
} from './filter-box/ReactFilterBox'
import { Completion, HintResult } from './filter-box/models/ExtendedCodeMirror'
import { Area, Label, Project } from '../../main/generated/typescript-helpers'

const GET_DATA = gql`
  query {
    projects(input: { deleted: false }) {
      key
      name
    }
    areas {
      key
      name
    }
    labels {
      key
      name
    }
    theme @client
  }
`

const filterOptions = [
  {
    columnField: 'key',
    type: 'text',
  },
  {
    columnField: 'type',
    type: 'selection',
  },
  {
    columnField: 'text',
    type: 'text',
  },
  {
    columnField: 'deleted',
    type: 'selection',
  },
  {
    columnField: 'completed',
    type: 'selection',
  },
  {
    columnField: 'lastUpdatedAt',
    type: 'text',
  },
  {
    columnField: 'scheduledAt',
    type: 'text',
  },
  {
    columnField: 'dueAt',
    type: 'text',
  },
  {
    columnField: 'completedAt',
    type: 'text',
  },
  {
    columnField: 'deletedAt',
    type: 'text',
  },
  {
    columnField: 'createdAt',
    type: 'text',
  },
  {
    columnField: 'labelKey',
    columnText: 'label',
    type: 'selection',
  },
  {
    columnField: 'projectKey',
    columnText: 'project',
    type: 'selection',
  },
  {
    columnField: 'areaKey',
    columnText: 'area',
    type: 'selection',
  },
]

class CustomAutoComplete extends GridDataAutoCompleteHandler {
  needOperators(parsedCategory) {
    switch (parsedCategory) {
      case 'dueAt':
      case 'scheduledAt':
      case 'completedAt':
      case 'lastUpdatedAt':
      case 'createdAt':
      case 'deletedAt':
        return ['=', '!=', 'is', '!is', '<', '>']
      case 'key':
      case 'type':
      case 'completed':
      case 'deleted':
      case 'area':
      case 'label':
      case 'project':
        return ['=', '!=', 'is', '!is']
      default:
        return ['=', '!=']
    }
  }

  needValues(parsedCategory, parsedOperator) {
    const isDateCategory = [
      'dueAt',
      'scheduledAt',
      'completedAt',
      'lastUpdatedAt',
      'deletedAt',
      'createdAt',
    ].includes(parsedCategory)

    if (
      parsedOperator == '>' ||
      parsedOperator == '<' ||
      (parsedOperator == '=' && isDateCategory)
    ) {
      return [{ customType: 'date' }]
    }

    if (parsedOperator == 'is' || parsedOperator == '!is') {
      if (isDateCategory) {
        return ['null', 'past', 'today', 'this week', 'this month']
      }
      return ['null']
    }

    return super.needValues(parsedCategory, parsedOperator)
  }
}

const generateInputData = (data: any): any[] => {
  const all = {
    type: { values: ['TODO', 'NOTE'], length: 2 },
    deleted: { values: ['false', 'true'], length: 2 },
    completed: { values: ['false', 'true'], length: 2 },
    projects: { values: data.projects.map((p: Project) => p.name), length: data.projects.length },
    areas: { values: data.areas.map((a: Area) => a.name), length: data.areas.length },
    labels: { values: data.labels.map((l: Label) => l.name), length: data.labels.length },
  }

  let longest = 'type'
  Object.keys(all).map((o) => {
    all[o].length > all[longest].length ? (longest = o) : null
  })

  return [...Array(all[longest].length)].map((p, idx) => {
    return {
      type: all.type.values[idx % all.type.length],
      deleted: all.deleted.values[idx % all.deleted.length],
      completed: all.completed.values[idx % all.completed.length],
      project: all.projects.values[idx % all.projects.length],
      area: all.areas.values[idx % all.areas.length],
      label: all.labels.values[idx % all.labels.length],
    }
  })
}

type ItemFilterBoxProps = {
  filter: string
  onSubmit: (query: string, filter: Expression[]) => void
}

const ItemFilterBox = (props: ItemFilterBoxProps): ReactElement => {
  const [errorMessage, setErrorMessage] = useState('')
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const inputData = generateInputData(data)
  const theme = themes[data.theme]

  const customRenderCompletionItem = (
    self: HintResult,
    data: Completion,
    registerAndGetPickFunc: Function,
  ) => {
    if (data.value?.customType == 'date') {
      const pick = registerAndGetPickFunc()
      return (
        <ThemeProvider theme={theme}>
          <Wrapper>
            <DatePicker
              inline
              showTimeSelect
              onChange={(day) => {
                return pick(day.toISOString())
              }}
            />
          </Wrapper>
        </ThemeProvider>
      )
    }

    return (
      <ThemeProvider theme={theme}>
        <Suggestion>
          <span>{data.value}</span>
        </Suggestion>
      </ThemeProvider>
    )
  }

  const customAutoComplete = new CustomAutoComplete(inputData, filterOptions)

  const onParseOk = (query: string, expressions: Expression[]) => {
    setErrorMessage('')
    const transformedExpressions = expressions.map((e) => {
      switch (e.category) {
        case 'project':
          return {
            ...e,
            category: 'projectKey',
            value: data.projects.find((p) => p.name == e.value).key,
          }
          break
        case 'area':
          return {
            ...e,
            category: 'areaKey',
            value: data.areas.find((p) => p.name == e.value).key,
          }
          break
        case 'label':
          return {
            ...e,
            category: 'labelKey',
            value: data.labels.find((p) => p.name == e.value).key,
          }
          break

        default:
          return e
          break
      }
    })
    props.onSubmit(query, transformedExpressions)
  }

  const onParseError = (error: Error, validationResult: { isValid: boolean; message?: string }) => {
    if (validationResult.isValid != true) {
      setErrorMessage(validationResult.message)
    } else {
      setErrorMessage(
        `${error.message} at ${error?.location?.start.line}:${error?.location?.start.column}`,
      )
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <FilterContainer>
        <ReactFilterBox
          data={inputData}
          autoCompleteHandler={customAutoComplete}
          customRenderCompletionItem={customRenderCompletionItem}
          options={filterOptions}
          query={props.filter}
          onParseOk={onParseOk}
          onChange={() => {}}
          onParseError={onParseError}
          strictMode={true}
        />
        <Error>{errorMessage}</Error>
      </FilterContainer>
    </ThemeProvider>
  )
}

export default ItemFilterBox
