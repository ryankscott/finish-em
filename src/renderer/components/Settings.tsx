import { gql, useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Icon,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import colormap from 'colormap';
import { Calendar, Feature, Label } from 'main/resolvers-types';
import { ReactElement } from 'react';
import { Icons } from 'renderer/assets/icons';
import { useSettings } from 'renderer/hooks';
import { v4 as uuidv4 } from 'uuid';
import {
  CREATE_LABEL,
  DELETE_LABEL,
  GET_SETTINGS,
  RECOLOUR_LABEL,
  RENAME_LABEL,
  SET_ACTIVE_CALENDAR,
  SET_FEATURE,
  SET_FEATURE_METADATA,
} from '../queries';
import { camelCaseToInitialCaps } from '../utils';
import CloudSync from './CloudSync';
import LabelEdit from './LabelEdit';
import Select from './Select';

const NUMBER_OF_COLOURS = 12;

type SettingHeaderProps = { name: string };
const SettingHeader = ({ name }: SettingHeaderProps): JSX.Element => (
  <Text py={4} px={0} fontSize="2xl" fontWeight="semibold">
    {name}
  </Text>
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
  const { colorMode } = useColorMode();
  const settings = useSettings();
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
        __typename: 'Label',
        key: deleteLabel,
      });
      cache.evict({ id: cacheId });
    },
  });

  const colours = colormap({
    colormap: 'jet',
    nshades: NUMBER_OF_COLOURS,
    format: 'hex',
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

  const calendarOptions = generateOptions(data.calendars);

  return (
    <Flex direction="row" w="100%" h="100vh">
      <Tabs orientation="vertical" variant="custom">
        <TabList>
          <Text p={4} fontSize="lg" fontWeight="semibold">
            Settings
          </Text>
          <Tab borderRadius="none" justifyContent="start">
            Features
          </Tab>
          <Tab borderRadius="none" justifyContent="start">
            Labels
          </Tab>
          <Tab borderRadius="none" justifyContent="start">
            Advanced
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={10}>
            <SettingHeader name="Features" />
            {data.features.map((feature: Feature) => {
              return (
                <Flex
                  direction="row"
                  justifyContent="flex-start"
                  w="100%"
                  h="30px"
                  py={5}
                  px={0}
                  alignItems="center"
                  key={feature.key}
                >
                  <Text fontSize="sm" w="180px" key={`${feature.key}-label`}>
                    {camelCaseToInitialCaps(feature.name)}
                  </Text>
                  <Switch
                    size="sm"
                    isChecked={feature.enabled ?? false}
                    onChange={() => {
                      window.electronAPI.ipcRenderer.toggleFeature(
                        feature.name,
                        !feature.enabled
                      );
                      setFeature({
                        variables: {
                          key: feature.key,
                          enabled: !feature.enabled,
                        },
                      });
                    }}
                  />
                  {feature.name === 'calendarIntegration' && (
                    <Box pl={3} w="180px">
                      <Select
                        isDisabled={!feature.enabled}
                        key={`${feature.key}-select`}
                        autoFocus
                        placeholder="Choose calendar"
                        defaultValue={calendarOptions.filter(
                          (option) =>
                            option.label ===
                            data?.calendars.find((c) => c.active)?.name
                        )}
                        onChange={(e) => {
                          setActiveCalendar({
                            variables: { key: e.value },
                          });
                        }}
                        options={calendarOptions}
                        escapeClearsValue
                      />
                    </Box>
                  )}
                  {feature.name === 'bearNotesIntegration' && (
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
                        }}
                        fontSize="sm"
                        placeholder="Bear API Token"
                        isDisabled={!feature.enabled}
                      >
                        <EditablePreview
                          _hover={{
                            bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
                          }}
                          py={2}
                        />
                        <EditableInput py={2} />
                      </Editable>
                    </Box>
                  )}
                </Flex>
              );
            })}
          </TabPanel>
          <TabPanel px={10}>
            <SettingHeader name="Labels" />
            {Object.values(data.labels).map((label: Label) => {
              return (
                <Flex id={label.key} key={`f-${label.key}`} my={0.5}>
                  <LabelEdit
                    name={label.name ?? ''}
                    colour={label.colour ?? '#F00F00'}
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
            <Flex w="185px" justifyContent="center" pt={3}>
              <Button
                variant="default"
                size="md"
                rightIcon={<Icon as={Icons.add} />}
                onClick={() => {
                  createLabel({
                    variables: {
                      key: uuidv4(),
                      name: 'New Label',
                      colour:
                        colours[Math.floor(Math.random() * NUMBER_OF_COLOURS)],
                    },
                  });
                }}
              >
                Add label
              </Button>
            </Flex>
          </TabPanel>
          <TabPanel px={10}>
            <SettingHeader name="Advanced" />
            <Text fontSize="md" fontWeight={500} mt={-2} mb={4}>
              🐉 Changing these properties can cause you to lose all your data!!
            </Text>
            <Flex my={0.5} direction={'column'}>
              {Object.keys(settings).map((key) => {
                if (key === '__internal__') return;
                const setting = settings[key];
                return (
                  <Flex
                    key={key}
                    direction="row"
                    justifyContent="flex-start"
                    py={5}
                    px={0}
                    w="100%"
                    h="30px"
                    alignItems="center"
                  >
                    <Text fontSize="sm" w="180px" fontWeight="bold">
                      {camelCaseToInitialCaps(key)}
                    </Text>

                    {key === 'cloudSync' && (
                      <CloudSync
                        enabled={setting.enabled}
                        email={setting.email}
                        token={setting.token}
                      />
                    )}
                    {key === 'overrideDatabaseDirectory' && (
                      <>
                        <Text ml={3} fontSize="sm">
                          {setting}
                        </Text>
                        <Button
                          ml={3}
                          onClick={async () => {
                            const newDirectory =
                              await window.electronAPI.ipcRenderer.openDialog({
                                title: 'Open folder',
                                properties: ['openDirectory'],
                              });
                            window.electronAPI.ipcRenderer.setSetting(
                              'overrideDatabaseDirectory',
                              newDirectory?.[0]
                            );
                          }}
                        >
                          Open
                        </Button>
                      </>
                    )}
                  </Flex>
                );
              })}
              <Alert status="warning" size={'sm'} borderRadius={'md'} my={4}>
                <AlertIcon />
                <AlertDescription fontSize={'md'}>
                  Finish-em will restart after chosing a new database directory
                </AlertDescription>
              </Alert>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};
export default Settings;
