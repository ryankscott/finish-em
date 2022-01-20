import React, { ReactElement, useState } from 'react'
import { gql, useQuery } from '@apollo/client'
import ReactFilterBox from './filter-box/ReactFilterBox'
import { Completion, HintResult } from './filter-box/models/ExtendedCodeMirror'
import { Area, Label, Project } from '../../main/generated/typescript-helpers'
import Expression from './filter-box/Expression'
import GridDataAutoCompleteHandler, { Option } from './filter-box/GridDataAutoCompleteHandler'
import ParsedError from './filter-box/ParsedError'
import { ValidationResult } from './filter-box/validateQuery'
import { Box, Text } from '@chakra-ui/layout'

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
  }
`

const filterOptions: Option[] = [
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
    customValuesFunc: (a, b) => {
      console.log(a)
      console.log(b)
      return ['cat', 'dog']
    },
  },
  {
    columnField: 'areaKey',
    columnText: 'area',
    type: 'selection',
  },
  {
    columnField: 'repeat',
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
      case 'repeat':
        return ['is', '!is']
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
  /* 
This is a super weird data structure that's needed for the component 
For each of the "types" in the dropdown, you need all of the options
In order to generate that, you need to generate an entry with that option
This data structure tries to generate the least number of entries in the array 
but give all the options of all the different "types"
*/
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
  onError?: () => void
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

  const customRenderCompletionItem = (
    self: HintResult,
    data: Completion,
    registerAndGetPickFunc: Function,
  ) => {
    return (
      <Box
        my={2}
        mx={0}
        p={3}
        bg={'transparent'}
        _hover={{ bg: 'gray.200' }}
        _active={{ bg: 'gray.200' }}
      >
        <span>{data.value}</span>
      </Box>
    )
  }

  const customAutoComplete = new CustomAutoComplete(inputData, filterOptions)

  const transformExpression = (e: Expression): Expression => {
    switch (e.category) {
      case 'project':
        return {
          ...e,
          category: 'projectKey',
          value: e.value == 'null' ? 'null' : data.projects.find((p) => p.name == e.value)?.key,
        }

      case 'area':
        return {
          ...e,
          category: 'areaKey',
          value: e.value == 'null' ? 'null' : data.areas.find((p) => p.name == e.value)?.key,
        }

      case 'label':
        return {
          ...e,
          category: 'labelKey',
          value: e.value == 'null' ? 'null' : data.labels.find((p) => p.name == e.value)?.key,
        }

      default:
        return e
        break
    }
  }

  const onParseOk = (query: string, expressions: Expression[]) => {
    setErrorMessage('')
    const transformedExpressions = expressions.map((e) => {
      if (e.expressions) {
        e.expressions = e.expressions.map((es) => transformExpression(es))
      }
      return transformExpression(e)
    })
    props.onSubmit(query, transformedExpressions)
  }

  const onParseError = (
    query: string,
    result: Expression[] | ParsedError,
    error?: ValidationResult,
  ) => {
    // This library has two different validations, this first one is the "simple" one
    if (error.isValid != true) {
      setErrorMessage(error.message)
    } else {
      // This second one is a parser error, types are fucked
      setErrorMessage(
        `${result.message} at ${result?.location?.start.line}:${result?.location?.start.column}`,
      )
    }
    if (props.onError) {
      props.onError()
    }
  }

  return (
    <Box w={'auto'} my={0} mx={2} overflowX={'scroll'}>
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
      <Text fontSize="sm" fontFamily="mono" w={'100%'} m={0} mt={1} color={'red.500'} pl={1}>
        {errorMessage}
      </Text>
    </Box>
  )
}

export default ItemFilterBox
