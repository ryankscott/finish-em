/* eslint-disable react/destructuring-assignment */
import QueryBuilder, {
  defaultValueProcessor,
  Field,
  formatQuery,
} from 'react-querybuilder';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { capitaliseFirstLetter } from 'renderer/utils';
import CustomActionElement from './CustomActionElement';
import CustomFieldSelector from './CustomFieldSelector';
import CustomDragHandle from './CustomDragHandle';
import CustomValueEditor from './CustomValueEditor';

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
    name: 'DATE(dueAt)',
    label: 'Due date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(scheduledAt)',
    label: 'Scheduled date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(completedAt)',
    label: 'Completed date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(deletedAt)',
    label: 'Deleted date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(createdAt)',
    label: 'Created date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'DATE(lastUpdatedAt)',
    label: 'Last updated date',
    operators: [
      { name: 'null', label: 'is null' },
      { name: 'notNull', label: 'is not null' },
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
];

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
`;

const generateDynamicFields = (data: {
  projects: { key: string; name: string }[];
  areas: { key: string; name: string }[];
  labels: { key: string; name: string }[];
}) => {
  return Object.keys(data).map((d) => {
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
      ],
    };
  });
};

const ItemFilterBuilder = () => {
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_DATA);
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const dynamicFields = generateDynamicFields(data);
  const fields = [...defaultFields, ...dynamicFields];

  const valueProcessor = (field: Field, operator: string, value) => {
    const dateField = [
      'DATE(dueAt)',
      'DATE(completedAt)',
      'DATE(scheduledAt)',
      'DATE(deletedAt)',
      'DATE(lastUpdatedAt)',
      'DATE(createdAt)',
    ].includes(field);
    if (dateField) {
      if (value === 'Today') {
        // Assuming `value` is an array, such as from a multi-select
        return `DATE(date()))`;
      }
      if (value === 'Tomorrow') {
        return `DATE(date('+1 day')))`;
      }
    }
    return defaultValueProcessor(field, operator, value);
  };

  return (
    <Box
      p={2}
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      borderRadius="md"
      my={2}
    >
      <QueryBuilder
        enableDragAndDrop={false}
        fields={fields}
        query={query}
        onQueryChange={(q) => setQuery(q)}
        controlElements={{
          addGroupAction: CustomActionElement,
          addRuleAction: CustomActionElement,
          cloneGroupAction: CustomActionElement,
          cloneRuleAction: CustomActionElement,
          valueEditor: CustomValueEditor,
          fieldSelector: CustomFieldSelector,
          lockRuleAction: CustomActionElement,
          lockGroupAction: CustomActionElement,
          removeGroupAction: CustomActionElement,
          removeRuleAction: CustomActionElement,
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
          {formatQuery(query, {
            format: 'sql',
            valueProcessor,
          })}
        </Text>
      </Box>
    </Box>
  );
};

export default ItemFilterBuilder;
