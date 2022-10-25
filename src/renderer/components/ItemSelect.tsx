import { useQuery } from '@apollo/client';
import { Box } from '@chakra-ui/react';
import { groupBy } from 'lodash';
import { ReactElement } from 'react';
import { GET_ITEMS } from 'renderer/queries';
import { Item } from '../../main/generated/typescript-helpers';
import {
  markdownBasicRegex,
  markdownLinkRegex,
  removeItemTypeFromString,
} from '../utils';
import Select from './Select';

type ItemSelectProps = {
  currentItem: Item;
  completed: boolean;
  deleted: boolean;
  onSubmit: (key: string) => void;
  invert?: boolean;
};

export default function ItemSelect({
  currentItem,
  completed,
  deleted,
  onSubmit,
  invert = false,
}: ItemSelectProps): ReactElement {
  const { loading, error, data } = useQuery(GET_ITEMS);

  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }

  const generateOptions = () => {
    const filteredValues = data.items.filter(
      (i: Item) =>
        i.key != null &&
        i.key !== currentItem.key &&
        i.deleted === false &&
        i.completed === false
    );

    // Return if we've filtered all items
    if (!filteredValues.length) return [];

    // Group them by project
    const itemsGroupedByProject = groupBy(filteredValues, 'project.name');

    // Show the items from the project the item is in first
    // Update the label to be the project name, and the items to be the right format
    const allGroups = Object.keys(itemsGroupedByProject)?.map((project) => {
      return {
        label: project || 'No Project',
        // It's possible to not have a project
        options: itemsGroupedByProject[project]?.map((item: Item) => {
          return {
            value: item.key,
            label: removeItemTypeFromString(item.text ?? '')
              .replace(markdownLinkRegex, '$1')
              .replace(markdownBasicRegex, '$1'),
          };
        }),
      };
    });

    // Sort to ensure that the current project is at the front
    allGroups.sort((a, b) => {
      if (!currentItem?.project?.key) return 0;
      if (a.label === currentItem?.project?.name) return -1;
      if (b.label === currentItem?.project?.name) return 1;
      return 0;
    });

    // If it's already a subtask add an option to create it to a task
    if (currentItem?.parent != null) {
      return [
        ...allGroups,
        {
          label: 'Options',
          options: [{ value: '', label: 'Convert to task' }],
        },
      ];
    }
    return allGroups;
  };

  const options = generateOptions();
  const flattenedOptions = options
    ?.map((o) => {
      return o.options;
    })
    .flat();

  const defaultValue = flattenedOptions?.filter(
    (o) => o.value === currentItem.parent?.key
  );

  return (
    <Box w="100%" cursor={completed || deleted ? 'not-allowed' : 'inherit'}>
      <Select
        isMulti={false}
        isDisabled={completed || deleted}
        onChange={(p) => {
          onSubmit(p.value);
        }}
        options={options}
        escapeClearsValue
        placeholder="Add parent"
        defaultValue={defaultValue}
        invertColours={invert}
        renderLabelAsElement={false}
      />
    </Box>
  );
}
