import { List, ListItem, Text, Code, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Page from './Page';

const filterAttributes: { name: string; description: string }[] = [
  { name: 'key', description: 'the ID of the item' },
  { name: 'type', description: 'TODO or NOTE depending on the item type' },
  { name: 'text', description: ' the name of the item' },
  { name: 'deleted', description: ' whether or not an item is deleted' },
  { name: 'completed', description: ' whether or not the item is completed' },
  { name: 'lastUpdatedAt', description: ' the last datetime an item changed' },
  { name: 'scheduledAt', description: ' scheduled datetime of an item' },
  { name: 'dueAt', description: ' due datetime of an item' },
  { name: 'completedAt', description: ' datetime an item was completed' },
  { name: 'deletedAt', description: ' datetime an item was deleted' },
  { name: 'createdAt', description: ' datetime an item was created' },
  { name: 'label', description: ' the label that was assigned to an item' },
  { name: 'project', description: 'the project that an item was part of' },
  { name: 'area', description: 'the area that an item was part of' },
  { name: 'repeat', description: 'whether or not the item repeats' },
];

const Help = (): ReactElement => {
  return (
    <Page>
      <VStack w="100%" justifyContent="flex-start">
        <Text py={4} w="100%" fontSize="3xl" color="blue.500">
          Help
        </Text>
        <Text w="100%" fontSize="2xl">
          Filter Syntax
        </Text>
        <Text w="100%" fontSize="xl">
          Attributes
        </Text>
        <List pl={2} w="100%">
          {filterAttributes.map((f) => {
            return (
              <ListItem py={1}>
                <Text fontSize="md" w="100%">
                  <Code>{f.name}</Code> - {f.description}
                </Text>
              </ListItem>
            );
          })}
        </List>
      </VStack>
    </Page>
  );
};

export default Help;
