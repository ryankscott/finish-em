import { gql, useMutation, useQuery } from "@apollo/client";
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  FlexProps,
  Icon,
  Switch,
  Text,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import colormap from "colormap";
import { ReactElement } from "react";
import { v4 as uuidv4 } from "uuid";
import { Icons } from "../assets/icons";
import {
  CREATE_LABEL,
  DELETE_LABEL,
  GET_SETTINGS,
  RECOLOUR_LABEL,
  RENAME_LABEL,
  SET_ACTIVE_CALENDAR,
  SET_FEATURE,
  SET_FEATURE_METADATA,
} from "../queries";
import { Calendar, Feature, Label } from "../resolvers-types";
import { camelCaseToInitialCaps, isElectron } from "../utils";
import AdvancedSettings from "./AdvancedSettings";
import LabelEdit from "./LabelEdit";
import Page from "./Page";
import Select from "./Select";
import SettingHeader from "./SettingHeader";

const NUMBER_OF_COLOURS = 12;

const FeatureContent = (props: FlexProps) => (
  <Flex
    direction="row"
    justifyContent="flex-start"
    w="100%"
    h="30px"
    py={5}
    px={0}
    alignItems="center"
  >
    {props.children}
  </Flex>
);

const SettingContent = (props: FlexProps) => (
  <Flex direction="column" w="100%">
    {props.children}
  </Flex>
);

const generateOptions = (
  cals: Calendar[]
): { value: string; label: string }[] => {
  return cals?.map((c) => {
    return {
      value: c.key,
      label: c.name,
    };
  });
};

const Settings = (): ReactElement => {
  const isRunningInElectron = isElectron();
  const settingsOrientation = useBreakpointValue([
    "horizontal",
    "horizontal",
    "vertical",
    "vertical",
  ]) as "horizontal" | "vertical";
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_SETTINGS);
  const [setActiveCalendar] = useMutation(SET_ACTIVE_CALENDAR, {
    refetchQueries: [GET_SETTINGS],
  });
  const [setFeature] = useMutation(SET_FEATURE, {
    refetchQueries: [GET_SETTINGS],
  });
  const [setFeatureMetadata] = useMutation(SET_FEATURE_METADATA);
  const [renameLabel] = useMutation(RENAME_LABEL, {});
  const [setColourOfLabel] = useMutation(RECOLOUR_LABEL);
  const [deleteLabel] = useMutation(DELETE_LABEL, {
    update(cache, { data: { deleteLabel } }) {
      const cacheId = cache.identify({
        __typename: "Label",
        key: deleteLabel,
      });
      cache.evict({ id: cacheId });
    },
  });

  const colours = colormap({
    colormap: "jet",
    nshades: NUMBER_OF_COLOURS,
    format: "hex",
    alpha: 1,
  });

  // We have to update the cache on add / removes
  const [createLabel] = useMutation(CREATE_LABEL, {
    update(cache, { data: { createLabel } }) {
      cache.modify({
        fields: {
          labels(existingLabels = []) {
            const newLabelRef = cache.writeFragment({
              data: createLabel,
              fragment: gql`
                fragment NewLabel on Label {
                  key
                  name
                }
              `,
            });
            return [...existingLabels, newLabelRef];
          },
        },
      });
    },
  });

  // TODO: Loading and error states
  if (loading) return <></>;
  if (error) return <></>;
  if (!data) return <></>;

  const determineFeatureComponent = (feature: Feature) => {
    switch (feature.name) {
      case "calendarIntegration":
        if (!isRunningInElectron) return null;
        return (
          <FeatureContent>
            <Text fontSize="sm" w="180px" key={`${feature.key}-label`}>
              {camelCaseToInitialCaps(feature.name)}
            </Text>
            <Box pl={3} w="180px">
              <Select
                isDisabled={!feature.enabled}
                key={`${feature.key}-select`}
                autoFocus
                placeholder="Choose calendar"
                defaultValue={calendarOptions.filter(
                  (option) =>
                    option.label === data?.calendars.find((c) => c.active)?.name
                )}
                onChange={(e) => {
                  setActiveCalendar({
                    variables: { key: e.value },
                  });
                  // @ts-ignore
                  window.electronAPI.ipcRenderer.toggleFeature(
                    feature.name,
                    !feature.enabled
                  );
                }}
                options={calendarOptions}
                escapeClearsValue
              />
            </Box>
          </FeatureContent>
        );
      case "bearNotesIntegration":
        if (!isRunningInElectron) {
          return null;
        }
        return (
          <FeatureContent>
            <Text fontSize="sm" w="180px" key={`${feature.key}-label`}>
              {camelCaseToInitialCaps(feature.name)}
            </Text>
            <Box pl={3} w="180px">
              <Editable
                defaultValue={feature?.metadata?.apiToken}
                onSubmit={(val) => {
                  setFeatureMetadata({
                    variables: {
                      key: feature.key,
                      metadata: { apiToken: val },
                    },
                  });
                  // @ts-ignore
                  window.electronAPI.ipcRenderer.toggleFeature(
                    feature.name,
                    !feature.enabled
                  );
                }}
                fontSize="sm"
                placeholder="Bear API Token"
                isDisabled={!feature.enabled}
              >
                <EditablePreview
                  _hover={{
                    bg: colorMode === "light" ? "gray.100" : "gray.900",
                  }}
                  py={2}
                />
                <EditableInput py={2} />
              </Editable>
            </Box>
          </FeatureContent>
        );
      default:
        return (
          <FeatureContent>
            <Text fontSize="sm" w="180px" key={`${feature.key}-label`}>
              {camelCaseToInitialCaps(feature.name)}
            </Text>
            <Switch
              size="sm"
              isChecked={feature.enabled ?? false}
              onChange={() => {
                setFeature({
                  variables: {
                    key: feature.key,
                    enabled: !feature.enabled,
                  },
                });
              }}
            />
          </FeatureContent>
        );
    }
  };

  const calendarOptions = generateOptions(data.calendars);

  return (
    <Page>
      <Flex direction={"column"} p={2}>
        <Text fontSize="3xl" fontWeight="semibold" pb={2}>
          Settings
        </Text>

        <SettingHeader name="Features" />
        <SettingContent>
          {data.features.map((feature: Feature) =>
            determineFeatureComponent(feature)
          )}
        </SettingContent>
        <SettingHeader name="Labels" />
        <SettingContent justifyContent="center">
          <Flex maxW="400px" direction="column" justifyContent="center">
            {Object.values(data.labels).map((label: Label) => {
              return (
                <Flex id={label.key} key={`f-${label.key}`} my={0.5}>
                  <LabelEdit
                    name={label.name ?? ""}
                    colour={label.colour ?? "#F00F00"}
                    renameLabel={(name) => {
                      renameLabel({
                        // @ts-ignore
                        variables: { key: label.key, name: name },
                      });
                    }}
                    deleteLabel={() => {
                      deleteLabel({ variables: { key: label.key } });
                    }}
                    colourChange={(colour) => {
                      setColourOfLabel({
                        variables: { key: label.key, colour: colour },
                      });
                    }}
                  />
                </Flex>
              );
            })}
            <Button
              variant="default"
              size="md"
              maxW="180px"
              my={2}
              rightIcon={<Icon as={Icons.add} />}
              onClick={() => {
                createLabel({
                  variables: {
                    key: uuidv4(),
                    name: "New Label",
                    colour:
                      colours[Math.floor(Math.random() * NUMBER_OF_COLOURS)],
                  },
                });
              }}
            >
              Add label
            </Button>
          </Flex>
        </SettingContent>

        {isRunningInElectron && <AdvancedSettings />}
      </Flex>
    </Page>
  );
};
export default Settings;
