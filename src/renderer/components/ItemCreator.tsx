import { ReactElement, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMutation } from "@apollo/client";
import { Flex } from "@chakra-ui/react";
import {
  CREATE_ITEM,
  GET_HEADER_BAR_DATA,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
} from "../queries";
import EditItemCreator from "./EditItemCreator";
import EditableText from "./EditableText";
import { HTMLToPlainText } from "../utils";
import React from "react";

export type ItemCreatorProps = {
  readOnly?: boolean;
  componentKey?: string;
  shouldCloseOnSubmit?: boolean;
  shouldCloseOnBlur?: boolean;
  parentKey?: string;
  projectKey?: string | "0";
  dueAt?: Date;
  scheduledAt?: Date;
  repeat?: string;
  labelKey?: string;
  buttonText?: string;
  width?: string;
  hideButton?: boolean;
  onCreate?: () => void;
  onEscape?: () => void;
  editing?: boolean;
  style?: "subtle" | "default";
  setEditing?: (editing: boolean) => void;
};

const ItemCreator = ({
  readOnly,
  componentKey,
  shouldCloseOnBlur,
  shouldCloseOnSubmit,
  parentKey,
  projectKey,
  dueAt,
  scheduledAt,
  repeat,
  labelKey,
  buttonText,
  width,
  onCreate,
  onEscape,
  editing,
  setEditing,
}: ItemCreatorProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);

  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY, GET_HEADER_BAR_DATA],
  });

  return (
    <>
      {editing ? (
        <EditItemCreator
          componentKey={componentKey}
          onClose={() => setEditing && setEditing(false)}
        />
      ) : (
        <Flex
          position="relative"
          m={0}
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          borderRadius="md"
          width={width || "100%"}
          opacity={"1"}
          transition="width 0.2s ease-in-out 0.1s,opacity 0.2s,0.2s"
          data-cy="item-creator"
        >
          <EditableText
            singleLine
            onEscape={onEscape}
            placeholder="Add an item"
            shouldClearOnSubmit
            hideToolbar={false}
            shouldSubmitOnBlur={false}
            showBorder
            onUpdate={(text) => {
              const rawText = HTMLToPlainText(text);
              if (!rawText.trim()) return;
              createItem({
                variables: {
                  key: uuidv4(),
                  type: "TODO",
                  text,
                  projectKey: projectKey ?? "0",
                  parentKey,
                  dueAt,
                  scheduledAt,
                  repeat,
                  labelKey,
                },
              });
            }}
          />
        </Flex>
      )}
    </>
  );
};

export default ItemCreator;
