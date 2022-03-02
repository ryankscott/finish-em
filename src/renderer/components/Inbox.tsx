import { ReactElement } from 'react';
import { ItemIcons } from '../interfaces';
import FilteredItemList from './FilteredItemList';
import ItemCreator from './ItemCreator';
import ViewHeader from './ViewHeader';
import { Flex } from '@chakra-ui/react';

import { Page } from './Page';
const Inbox = (): ReactElement => {
  return (
    <Page>
      <Flex direction="column" m={5} p={5}>
        <ViewHeader
          componentKey="42c6cea5-785f-4418-bd0f-5f4d388f4496"
          name={'Inbox'}
          icon={'inbox'}
          readOnly={true}
        />
        <ItemCreator
          buttonText="Add Item"
          initiallyExpanded={true}
          shouldCloseOnSubmit={false}
          projectKey={'0'}
        />
        <Flex marginTop="2">
          <FilteredItemList
            componentKey="42c6cea5-785f-4418-bd0f-5f4d388f4497"
            isFilterable={true}
            listName="Inbox"
            filter={JSON.stringify({
              text: 'project = "Inbox"',
              value: [
                { category: 'projectKey', operator: '=', value: '0' },
                {
                  conditionType: 'AND',
                  category: 'areaKey',
                  operator: 'is',
                  value: 'null',
                },
                {
                  conditionType: 'AND',
                  category: 'deleted',
                  operator: '=',
                  value: 'false',
                },
                {
                  conditionType: 'AND',
                  category: 'completed',
                  operator: '=',
                  value: 'false',
                },
              ],
            })}
            flattenSubtasks={false}
            readOnly={true}
            hiddenIcons={[ItemIcons.Project]}
            shouldPoll={true}
          />
        </Flex>
      </Flex>
    </Page>
  );
};

export default Inbox;
