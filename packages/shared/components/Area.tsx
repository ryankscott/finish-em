import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Grid,
  GridItem,
  Icon,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Icons } from "../assets/icons";
import { ItemIcons } from "../interfaces";
import {
  ADD_COMPONENT,
  CREATE_PROJECT,
  DELETE_AREA,
  GET_AREA_BY_KEY,
  GET_SIDEBAR,
  RENAME_AREA,
  SET_DESCRIPTION_OF_AREA,
  SET_EMOJI,
} from "../queries";
import { v4 as uuidv4 } from "uuid";
import { formatRelativeDate, getProductName } from "../utils";
import DeleteAreaDialog from "./DeleteAreaDialog";
import { Donut } from "./Donut";
import EditableText from "./EditableText";
import EmojiDisplay from "./EmojiDisplay";
import EmojiPicker from "./EmojiPicker";
import FilteredItemList from "./FilteredItemList";
import Page from "./Page";
import { Project } from "../resolvers-types";

type AreaProps = {
  areaKey: string;
};
const Area = (props: AreaProps): ReactElement => {
  const { colorMode } = useColorMode();
  const { areaKey } = props;
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [setEmoji] = useMutation(SET_EMOJI);
  const [addComponent] = useMutation(ADD_COMPONENT);
  const [deleteArea] = useMutation(DELETE_AREA, {
    refetchQueries: [GET_SIDEBAR],
  });
  const [setDescriptionOfArea] = useMutation(SET_DESCRIPTION_OF_AREA);
  const [renameArea] = useMutation(RENAME_AREA);
  const [createProject] = useMutation(CREATE_PROJECT, {
    refetchQueries: [GET_SIDEBAR, GET_AREA_BY_KEY],
  });

  const { loading, error, data, refetch } = useQuery(GET_AREA_BY_KEY, {
    variables: { key: areaKey },
  });

  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }
  const { area } = data;

  const determineProgress = (
    totalItemsCount: number,
    completedItemsCount: number
  ): number => {
    if (totalItemsCount === 0) {
      return 0;
    }
    if (completedItemsCount === 0) {
      return 0;
    }
    return totalItemsCount / completedItemsCount;
  };

  return (
    <Page>
      <Grid
        alignItems="center"
        gridTemplateRows="60px 40px"
        gridTemplateColumns="110px 1fr"
        gridTemplateAreas={`
        "emoji name"
        "emoji ."`}
        py={2}
        px={0}
      >
        <GridItem gridArea="emoji">
          <Flex
            w="100px"
            h="100px"
            borderRadius="50%"
            justifyContent="center"
            fontSize="xl"
            boxShadow={colorMode === "light" ? "none" : "0 0 3px 0 #222"}
            bg={colorMode === "light" ? "gray.100" : "gray.800"}
            my={0}
            _hover={{
              bg: colorMode === "light" ? "gray.200" : "gray.900",
            }}
            transition="all 0.1s ease-in-out"
            cursor="pointer"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
          >
            {area?.emoji && <EmojiDisplay emojiId={area.emoji} />}
          </Flex>
        </GridItem>
        {showEmojiPicker && (
          <EmojiPicker
            onEmojiSelected={async (emoji) => {
              await setEmoji({ variables: { key: area.key, emoji: emoji.id } });
              setShowEmojiPicker(false);
              refetch();
            }}
          />
        )}
        <GridItem gridArea="name">
          <Flex w="100%" justifyContent="flex-start">
            <Editable
              key={uuidv4()}
              defaultValue={area.name}
              fontSize="3xl"
              mx={2}
              w="100%"
              color="blue.500"
              fontWeight="light"
              onSubmit={async (input) => {
                try {
                  await renameArea({
                    variables: { key: area.key, name: input },
                  });
                } catch (e) {
                  toast.error(
                    "Cannot rename area, an area with that name already exists"
                  );
                }
              }}
            >
              <EditablePreview px={2} />
              <EditableInput px={2} />
            </Editable>
            <DeleteAreaDialog
              onDelete={() => {
                deleteArea({ variables: { key: area.key } });
                navigate("/inbox");
              }}
            />
          </Flex>
        </GridItem>
      </Grid>
      <EditableText
        singleLine={false}
        placeholder="Add a description for your area"
        shouldClearOnSubmit={false}
        hideToolbar={false}
        shouldSubmitOnBlur
        input={area.description}
        onSubmit={(input) => {
          setDescriptionOfArea({
            variables: { key: area.key, description: input },
          });
        }}
      />
      <Text my={3} fontSize="xl" color="blue.500">
        Items
      </Text>
      <FilteredItemList
        componentKey={uuidv4()}
        isFilterable={false}
        filter={JSON.stringify({
          combinator: "and",
          rules: [
            {
              combinator: "and",
              rules: [
                {
                  field: "areaKey",
                  operator: "=",
                  valueSource: "value",
                  value: area.key,
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
              ],
              not: false,
            },
          ],
          not: false,
        })}
        flattenSubtasks
        hiddenIcons={[ItemIcons.Project]}
        readOnly
      />
      <Text my={3} mt={6} fontSize="xl" color="blue.500">
        Projects
      </Text>
      <Flex direction="column" pb={10}>
        {area.projects.map((p: Project) => {
          // Don't show inbox
          if (p.key === "0") return <></>;
          if (!p.items) return <></>;
          const totalItemsCount = p.items.length;
          const completedItemsCount = p.items.filter(
            (i) => i?.completed === true && i?.deleted === false
          ).length;
          const progress = determineProgress(
            totalItemsCount,
            completedItemsCount
          );
          return (
            <Grid
              key={p.key}
              position="relative"
              transition="all 0.1s ease-in-out"
              maxH="200px"
              maxW="650px"
              my={1}
              mx={0}
              padding={1}
              alignItems="center"
              cursor="pointer"
              borderRadius="md"
              _hover={{
                bg: colorMode === "light" ? "gray.100" : "gray.900",
              }}
              _after={{
                content: "''",
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
                margin: "0px auto",
                height: 1,
                width: "calc(100% - 10px)",
                borderBottom: "1px solid",
                borderColor: colorMode === "light" ? "gray.100" : "gray.700",
                opacity: 0.8,
              }}
              onClick={() => {
                navigate(`/views/${p.key}`);
              }}
              templateColumns="35px repeat(4, auto)"
              templateRows="auto"
              gridTemplateAreas={`"progress project project startAt endAt"`}
            >
              <GridItem gridTemplate="progress">
                <Donut size={18} progress={progress} />
              </GridItem>
              <GridItem gridTemplate="project">
                <Flex direction="row">
                  <Text fontSize="md" fontWeight="medium" pr={4}>
                    {p.name}
                  </Text>
                </Flex>
              </GridItem>
              <GridItem gridTemplate="startAt">
                <Text fontSize={"sm"}>
                  {
                    // @ts-ignore
                    p.startAt && `Starting: ${formatRelativeDate(p.startAt)}`
                  }
                </Text>
              </GridItem>
              <GridItem gridTemplate="endAt">
                <Text fontSize="sm">
                  {
                    //@ts-ignore
                    p.endAt && `Ending: ${formatRelativeDate(p.endAt)}`
                  }
                </Text>
              </GridItem>
            </Grid>
          );
        })}

        <Flex w="100%" my={2} justifyContent="flex-end">
          <Button
            variant="primary"
            rightIcon={<Icon as={Icons.add} />}
            onClick={async () => {
              const projectKey = uuidv4();
              await createProject({
                variables: {
                  key: projectKey,
                  name: getProductName(),
                  description: "",
                  startAt: null,
                  endAt: null,
                  areaKey: area.key,
                },
              });
              addComponent({
                variables: {
                  input: {
                    key: uuidv4(),
                    viewKey: projectKey,
                    type: "FilteredItemList",
                    location: "main",
                    parameters: {
                      filter: JSON.stringify({
                        combinator: "and",
                        rules: [
                          {
                            combinator: "and",
                            rules: [
                              {
                                field: "projectKey",
                                operator: "=",
                                valueSource: "value",
                                value: projectKey,
                              },
                              {
                                field: "deleted",
                                operator: "=",
                                valueSource: "value",
                                value: false,
                              },
                            ],
                            not: false,
                          },
                        ],
                        not: false,
                      }),
                      hiddenIcons: ["project"],
                      isFilterable: true,
                      listName: "Todo",
                      flattenSubtasks: true,
                      showCompletedToggle: true,
                      initiallyExpanded: true,
                    },
                  },
                },
              });
              navigate(`/views/${projectKey}`);
            }}
          >
            Add Project
          </Button>
        </Flex>
      </Flex>
    </Page>
  );
};

export default Area;
