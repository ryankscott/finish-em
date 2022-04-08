import { ReactElement } from 'react';
import { Flex } from '@chakra-ui/react';
import { ItemIcons } from '../interfaces';
import FilteredItemList from './FilteredItemList';
import ItemCreator from './ItemCreator';
import ViewHeader from './ViewHeader';
import Page from './Page';

const Inbox = (): ReactElement => {
  return (
    <Page>
      <Flex direction="column" m={5} p={5}>
        <ViewHeader
          componentKey="42c6cea5-785f-4418-bd0f-5f4d388f4496"
          name="Inbox"
          icon="inbox"
          readOnly
        />
        <ItemCreator
          buttonText="Add Item"
          initiallyExpanded
          shouldCloseOnSubmit={false}
          projectKey="0"
        />
        <Flex marginTop="2">
          <FilteredItemList
            componentKey="42c6cea5-785f-4418-bd0f-5f4d388f4497"
            isFilterable
            listName="Inbox"
            filter={JSON.stringify({
              combinator: 'and',
              rules: [
                {
                  combinator: 'and',
                  rules: [
                    {
                      field: 'projectKey',
                      operator: '=',
                      valueSource: 'value',
                      value: '0',
                    },
                    {
                      field: 'deleted',
                      operator: '=',
                      valueSource: 'value',
                      value: false,
                    },
                    {
                      field: 'areaKey',
                      operator: 'null',
                      valueSource: 'value',
                      value: '0',
                    },
                  ],
                  not: false,
                },
              ],
              not: false,
            })}
            flattenSubtasks={false}
            readOnly
            hiddenIcons={[ItemIcons.Project]}
            shouldPoll
          />
        </Flex>
      </Flex>
    </Page>
  );
};

export default Inbox;
