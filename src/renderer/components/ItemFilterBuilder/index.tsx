/* eslint-disable react/destructuring-assignment */
import QueryBuilder, {
  defaultValueProcessor,
  Field,
  formatQuery,
} from 'react-querybuilder';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { capitaliseFirstLetter } from 'renderer/utils';
import { GET_FILTER_DATA } from 'renderer/queries/filter';
import CustomActionElement from './CustomActionElement';
import CustomFieldSelector from './CustomFieldSelector';
import CustomDragHandle from './CustomDragHandle';
import CustomValueEditor from './CustomValueEditor';
import CustomDeleteButton from './CustomDeleteButton';

// TODO: This is duplicated in /main/api
export const valueProcessor = (
  field: string,
  operator: string,
  value: any
): string => {
  const dateField = [
    'DATE(dueAt)',
    'DATE(completedAt)',
    'DATE(scheduledAt)',
    'DATE(deletedAt)',
    'DATE(lastUpdatedAt)',
    'DATE(createdAt)',
  ].includes(field);

  const booleanField = ['completed', 'deleted'].includes(field);
  if (booleanField) {
    return (!!value).toString();
  }

  // This is crazy because we can only do one check so we need to coalesce this to ensure it's non-null
  if (field == `COALESCE(DATE(snoozedUntil), DATE(date('now')))`) {
    if (value) {
      return `> DATE(date('now'))`;
    }
    return ` <= DATE(date('now'))`;
  }

  if (dateField) {
    /*
      This craziness is because we are using a BETWEEN operator
    */
    if (value === 'past') {
      return `DATE(date('now', '-10 year')) AND DATE(date('now', '-1 day'))`;
    }
    if (value === 'today') {
      return `DATE(date()) AND DATE(date())`;
    }
    if (value === 'tomorrow') {
      return `DATE(date('now', '+1 day')) AND DATE(date('now', '+1 day'))`;
    }
    if (value === 'week') {
      return `strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-6 days') AND strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')`;
    }
    if (value === 'month') {
      return `strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0', '-1 month') AND strftime('%Y-%m-%d', 'now', 'localtime', 'weekday 0')`;
    }
  }
  return defaultValueProcessor(field, operator, value);
};

const defaultFields: Field[] = [
  {
    name: 'text',
    label: 'Text',
    operators: [
      { name: '=', label: 'is' },
      { name: 'beginsWith', label: 'begins with' },
      { name: 'endsWith', label: 'ends with' },
      { name: 'contains', label: 'contains' },
    ],
  },
  {
    name: 'deleted',
    label: 'Deleted',
    valueEditorType: 'switch',
    operators: [{ name: '=', label: 'is' }],
  },
  {
    name: 'completed',
    label: 'Completed',
    valueEditorType: 'switch',
    operators: [{ name: '=', label: 'is' }],
  },
  {
    name: `COALESCE(DATE(snoozedUntil), DATE(date('now')))`,
    label: 'Snoozed',
    valueEditorType: 'switch',
    operators: [{ name: '', label: 'is' }],
  },
  {
    name: 'DATE(dueAt)',
    label: 'Due date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(scheduledAt)',
    label: 'Scheduled date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(completedAt)',
    label: 'Completed date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(deletedAt)',
    label: 'Deleted date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(createdAt)',
    label: 'Created date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(lastUpdatedAt)',
    label: 'Last updated date',
    operators: [
      { name: 'between', label: 'is' },
      { name: 'notBetween', label: '!is' },
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: '=' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
];

const generateDynamicFields = (data: {
  projects: { key: string; name: string }[];
  areas: { key: string; name: string }[];
  labels: { key: string; name: string }[];
}) => {
  return Object.keys(data)?.map((d) => {
    return {
      name: `${d.slice(0, -1)}Key`,
      label: capitaliseFirstLetter(d.slice(0, -1)),
      valueEditorType: 'select',
      values: data?.[d].map((a) => {
        return { name: a.key, label: a.name };
      }),
      operators: [
        { name: '=', label: 'is' },
        { name: '!=', label: 'is not' },
        { name: 'null', label: 'is null' },
        { name: 'notNull', label: 'is not null' },
      ],
    };
  });
};

type ItemFilterBuilderProps = {
  defaultFilter: string;
  onSubmit: (filter: string) => void;
};

const ItemFilterBuilder = ({
  onSubmit,
  defaultFilter,
}: ItemFilterBuilderProps) => {
  let inputQuery = { combinator: 'and', rules: [] };
  try {
    const parsedFilter = JSON.parse(defaultFilter);
    // TODO: This is just in case somehow we get an old style filter
    if (!(Object.keys(parsedFilter)[0] === 'text')) {
      inputQuery = parsedFilter;
    }
  } catch (error) {
    console.log(error);
  }
  const { colorMode } = useColorMode();

  const [query, setQuery] = useState(inputQuery);
  const { loading, error, data } = useQuery(GET_FILTER_DATA);

  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const dynamicFields = generateDynamicFields(data);
  const fields = [...defaultFields, ...dynamicFields];

  console.log(`Query in FE: ${JSON.stringify(query)}`);
  return (
    <Box p={0} m={0} my={2}>
      <QueryBuilder
        enableDragAndDrop={false}
        fields={fields}
        query={query}
        onQueryChange={(q) => {
          onSubmit(JSON.stringify(q));
          setQuery(q);
        }}
        controlElements={{
          addGroupAction: CustomActionElement,
          addRuleAction: CustomActionElement,
          cloneGroupAction: CustomActionElement,
          cloneRuleAction: CustomActionElement,
          valueEditor: CustomValueEditor,
          fieldSelector: CustomFieldSelector,
          lockRuleAction: CustomActionElement,
          lockGroupAction: CustomActionElement,
          removeGroupAction: CustomDeleteButton,
          removeRuleAction: CustomDeleteButton,
          combinatorSelector: CustomFieldSelector,
          operatorSelector: CustomFieldSelector,
          dragHandle: CustomDragHandle,
        }}
      />
      <Box
        my={2}
        px={2}
        border="1px solid"
        borderRadius="md"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      >
        <Text fontSize="sm" fontFamily="mono" my={2}>
          {query &&
            formatQuery(query, {
              format: 'sql',
              valueProcessor,
            })}
        </Text>
      </Box>
    </Box>
  );
};

export default ItemFilterBuilder;
