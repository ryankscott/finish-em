import { useMutation } from "@apollo/client";
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  useOutsideClick,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Icons } from "../assets/icons";
import {
  CREATE_ITEM,
  GET_HEADER_BAR_DATA,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
} from "../queries";
import { formatRelativeDate } from "../utils";
import DatePicker from "./DatePicker";
import EditableText from "./EditableText";
import LabelSelect from "./LabelSelect";
import ProjectSelect from "./ProjectSelect";

interface ItemCreator2PropTypes {
  buttonText?: string;
  parentKey?: string;
  readOnly?: boolean;
  singleLine?: boolean;
  showProjectSelect?: boolean;
  content?: string;
  componentKey?: string;
  defaultProjectKey?: string;
  defaultDueAt?: Date;
  defaultScheduledAt?: Date;
  defaultLabelKey?: string;
}

const ItemCreator2 = ({
  buttonText,
  parentKey,
  defaultProjectKey,
  defaultLabelKey,
  defaultDueAt,
  defaultScheduledAt,
  showProjectSelect,
  readOnly,
  singleLine,
  content,
}: ItemCreator2PropTypes) => {
  const [showItemCreator, setShowItemCreator] = useState(false);
  const [labelKey, setLabelKey] = useState<string>();
  const [projectKey, setProjectKey] = useState<string>();
  const [dueDate, setDueDate] = useState<Date | null | undefined>();
  const [scheduledDate, setScheduledDate] = useState<Date | null | undefined>();
  const [itemText, setItemText] = useState<string>();

  useEffect(() => {
    if (defaultProjectKey) {
      setProjectKey(defaultProjectKey);
    }
  }, [defaultProjectKey]);

  useEffect(() => {
    if (defaultDueAt) {
      setDueDate(defaultDueAt);
    }
  }, [defaultDueAt]);

  useEffect(() => {
    if (defaultScheduledAt) {
      setScheduledDate(defaultScheduledAt);
    }
  }, [defaultScheduledAt]);

  useEffect(() => {
    if (defaultLabelKey) {
      setLabelKey(defaultLabelKey);
    }
  }, [defaultLabelKey]);

  const [createItem] = useMutation(CREATE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY, GET_HEADER_BAR_DATA],
  });

  const ref = useRef(null);
  useOutsideClick({
    ref: ref,
    handler: () => setShowItemCreator(false),
  });

  const createItemMutation = (itemText: string) => {
    createItem({
      variables: {
        key: uuidv4(),
        type: "TODO",
        text: itemText,
        projectKey: projectKey ?? "0",
        parentKey,
        dueAt: dueDate,
        scheduledAt: scheduledDate,
        labelKey,
      },
    });
    setShowItemCreator(false);
    setItemText("");
  };

  if (!showItemCreator) {
    return (
      <Flex w="100%">
        <Button
          variant="primary"
          leftIcon={<Icon as={Icons.add} />}
          size="md"
          onClick={() => {
            setShowItemCreator(!showItemCreator);
          }}
        >
          {buttonText ? buttonText : "Add task"}
        </Button>
      </Flex>
    );
  }

  return (
    <Flex
      ref={ref}
      direction="column"
      border={"1px solid"}
      borderColor={"chakra-border-color"}
      borderRadius="md"
      p={4}
    >
      <EditableText
        size="md"
        input={content}
        readOnly={readOnly ?? false}
        singleLine={singleLine ?? true}
        shouldSubmitOnBlur={false}
        shouldClearOnSubmit={true}
        onUpdate={(input) => {
          setItemText(input);
        }}
        onSubmit={(input) => {
          createItemMutation(input ?? "");
        }}
      />
      <Flex mt={[6, 6, 2, 2]} direction="column">
        <Flex py={2} flexWrap="wrap">
          {showProjectSelect && (
            <Box w="160px" pr={1}>
              <ProjectSelect
                currentProjectKey={projectKey ?? null}
                completed={false}
                deleted={false}
                onSubmit={(projectKey) => {
                  setProjectKey(projectKey);
                }}
              />
            </Box>
          )}
          <Box w="160px" pr={1}>
            <DatePicker
              key="sd"
              text={formatRelativeDate(scheduledDate)}
              defaultText="Scheduled on:"
              onSubmit={(d: Date | null) => {
                setScheduledDate(d);
              }}
              completed={false}
              deleted={false}
              icon={"scheduled"}
            />
          </Box>
          <Box w="160px" pr={1}>
            <DatePicker
              key="dd"
              text={formatRelativeDate(dueDate)}
              defaultText="Due on: "
              onSubmit={(d: Date | null) => {
                setDueDate(d);
              }}
              completed={false}
              deleted={false}
              icon={"due"}
            />
          </Box>

          <Box w="160px" pr={1}>
            <LabelSelect
              showIcon
              currentLabelKey={labelKey}
              onSubmit={(labelKey) => {
                setLabelKey(labelKey);
              }}
              completed={false}
              deleted={false}
            />
          </Box>
        </Flex>
        <Flex justifyContent="flex-end" alignItems="flex-end" w="100%">
          <ButtonGroup size="md">
            <Button onClick={() => setShowItemCreator(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                createItemMutation(itemText ?? "");
              }}
            >
              Create
            </Button>
          </ButtonGroup>
        </Flex>
      </Flex>
    </Flex>
  );
};

export { ItemCreator2 };
