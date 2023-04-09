import { ReactElement } from "react";
import { Flex } from "@chakra-ui/react";
import { INBOX_COMPONENT_KEY } from "../consts";
import { ItemIcons } from "../interfaces";
import FilteredItemList from "./FilteredItemList";
import ItemCreator from "./ItemCreator";
import ViewHeader from "./ViewHeader";
import Page from "./Page";

const Inbox = (): ReactElement => {
  return (
    <Page>
      <Flex direction="column" m={5} p={5}>
        <ViewHeader
          componentKey={INBOX_COMPONENT_KEY}
          name="Inbox"
          icon="inbox"
        />
        <ItemCreator
          buttonText="Add Item"
          initiallyExpanded
          shouldCloseOnSubmit={false}
          projectKey="0"
        />
        <Flex marginTop="2">
          <FilteredItemList
            componentKey={INBOX_COMPONENT_KEY}
            isFilterable
            shouldPoll
            listName="Inbox"
            filter={JSON.stringify({
              combinator: "and",
              rules: [
                {
                  combinator: "and",
                  rules: [
                    {
                      field: "projectKey",
                      operator: "=",
                      valueSource: "value",
                      value: "0",
                    },
                    {
                      field: "deleted",
                      operator: "=",
                      valueSource: "value",
                      value: false,
                    },
                    {
                      field: "completed",
                      operator: "=",
                      valueSource: "value",
                      value: false,
                    },
                    {
                      field: "areaKey",
                      operator: "null",
                      valueSource: "value",
                      value: "0",
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
          />
        </Flex>
      </Flex>
    </Page>
  );
};

export default Inbox;
