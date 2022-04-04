/* eslint-disable react/destructuring-assignment */
import QueryBuilder, { Field, formatQuery } from 'react-querybuilder';
import { Box, Text, useColorMode } from '@chakra-ui/react';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import CustomActionElement from './CustomActionElement';
import CustomFieldSelector from './CustomFieldSelector';
import CustomDragHandle from './CustomDragHandle';
import CustomValueEditor from '../CustomValueEditor';

type Props = {};

const fields: Field[] = [
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
  /*
area
project
  */
  {
    name: 'label',
    label: 'Label',
    valueEditorType: 'multiselect',
    values: [{ name: 'foo', label: 'cat' }],
    operators: [
      { name: '=', label: 'is' },
      { name: '!=', label: 'is not' },
      { name: 'in', label: 'in' },
      { name: 'not in', label: 'not in' },
    ],
  },
  {
    name: 'dueAt',
    label: 'Due date',
    operators: [
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
      { name: 'this week', label: 'this week' },
    ],
    datatype: 'date',
  },
  {
    name: 'scheduledAt',
    label: 'Scheduled date',
    operators: [
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'completedAt',
    label: 'Completed date',
    operators: [
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'deletedAt',
    label: 'Deleted date',
    operators: [
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'createdAt',
    label: 'Created date',
    operators: [
      { name: '=', label: 'is' },
      { name: '>', label: 'after' },
      { name: '<', label: 'before' },
    ],
    datatype: 'date',
  },
  {
    name: 'lastUpdatedAt',
    label: 'Last updated date',
    operators: [
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

const ItemFilterBuilder = (props: Props) => {
  const [query, setQuery] = useState({ combinator: 'and', rules: [] });
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_DATA);
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }
  console.log(data);
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
          {formatQuery(query, 'sql')}
        </Text>
      </Box>
    </Box>
  );
};

export default ItemFilterBuilder;
