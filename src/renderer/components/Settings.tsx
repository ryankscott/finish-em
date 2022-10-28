import { gql, useMutation, useQuery } from '@apollo/client';
import { ReactElement, useEffect, useState } from 'react';
import colormap from 'colormap';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Flex,
  Text,
  Switch,
  useColorMode,
  Editable,
  EditableInput,
  EditablePreview,
  ColorMode,
  Button,
  Icon,
  AlertIcon,
  Alert,
  AlertDescription,
} from '@chakra-ui/react';
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
import Select from './Select';
import { camelCaseToInitialCaps } from '../utils';
import { Calendar, Label } from 'main/resolvers-types';
import LabelEdit from './LabelEdit';
import { Icons } from 'renderer/assets/icons';

const NUMBER_OF_COLOURS = 12;
type SettingCategory = 'FEATURES' | 'LABELS' | 'ADVANCED';

type SidebarHeadeProps = {
  name: string;
  colorMode: 'light' | 'dark';
  isActive: boolean;
  onClick: () => void;
};

const determineBackgroundColour = (
  isActive: boolean,
  colorMode: ColorMode
): string => {
  if (isActive) {
    if (colorMode === 'light') {
      return 'gray.200';
    }
    return 'gray.900';
  }
  if (colorMode === 'light') {
    return 'gray.50';
  }
  return 'gray.800';
};

const SidebarHeader = ({
  name,
  colorMode,
  isActive,
  onClick,
}: SidebarHeadeProps) => (
  <Text
    fontSize="md"
    fontWeight="regular"
    py={2}
    px={6}
    m={0}
    cursor="pointer"
    bg={determineBackgroundColour(isActive, colorMode)}
    onClick={() => {
      onClick();
    }}
  >
    {name}
  </Text>
);

type SettingHeaderProps = { name: string };
const SettingHeader = ({ name }: SettingHeaderProps): JSX.Element => (
  <Text py={4} px={0} fontSize="xl" fontWeight="semibold">
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
  const [activeCategory, setActiveCategory] =
    useState<SettingCategory>('FEATURES');
  const [settings, setSettings] = useState<Record<string, string>>({});

  const { loading, error, data } = useQuery(GET_SETTINGS);
  const [setActiveCalendar] = useMutation(SET_ACTIVE_CALENDAR);
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
  const { colorMode } = useColorMode();

  const colours = colormap({
    colormap: 'jet',
    nshades: NUMBER_OF_COLOURS,
    format: 'hex',
    alpha: 1,
  });

  useEffect(() => {
    const getSettings = async () => {
      const settings = await window.electronAPI.ipcRenderer.getSettings();
      setSettings(settings);
    };
    getSettings();
  }, []);

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
      <Flex
        borderRight="1px solid"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        direction="column"
        w="280px"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        py={2}
        px={0}
        h="100%"
        shadow="md"
      >
        <Text p={4} fontSize="lg" fontWeight="semibold">
          Settings
        </Text>
        <SidebarHeader
          name="Features"
          colorMode={colorMode}
          isActive={activeCategory === 'FEATURES'}
          onClick={() => setActiveCategory('FEATURES')}
        />
        <SidebarHeader
          name="Labels"
          colorMode={colorMode}
          isActive={activeCategory === 'LABELS'}
          onClick={() => setActiveCategory('LABELS')}
        />
        <SidebarHeader
          name="Advanced"
          colorMode={colorMode}
          isActive={activeCategory === 'ADVANCED'}
          onClick={() => setActiveCategory('ADVANCED')}
        />
      </Flex>
      <Flex position="relative" direction="column" p={2} w="100%">
        {activeCategory === 'FEATURES' && (
          <Box p={3} my={6} px={3}>
            <SettingHeader name="Features" />
            {data.features.map((feature) => {
              return (
                <Box key={`${feature.key}-container`}>
                  <Flex
                    direction="row"
                    justifyContent="flex-start"
                    py={3}
                    px={0}
                    w="100%"
                    h="30px"
                    alignItems="center"
                    key={feature.key}
                  >
                    <Text fontSize="sm" w="180px" key={`${feature.key}-label`}>
                      {camelCaseToInitialCaps(feature.name)}
                    </Text>
                    <Switch
                      size="sm"
                      onChange={() => {
                        // @ts-ignore
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
                      defaultChecked={feature.enabled ?? false}
                    />
                    {feature.name === 'calendarIntegration' && (
                      <Box pl={3} w="180px">
                        <Select
                          isDisabled={!feature.enabled}
                          key={`${feature.key}-select`}
                          autoFocus
                          placeholder="Choose calendar"
                          defaultValue={calendarOptions?.find(
                            (c) => c.value === data?.activeCalendar?.key
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
                              bg:
                                colorMode === 'light' ? 'gray.100' : 'gray.900',
                            }}
                            py={2}
                          />
                          <EditableInput py={2} />
                        </Editable>
                      </Box>
                    )}
                  </Flex>
                </Box>
              );
            })}
          </Box>
        )}
        {activeCategory === 'LABELS' && (
          <Box p={3} my={6} px={3}>
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
          </Box>
        )}
        {activeCategory === 'ADVANCED' && (
          <Box p={3} my={6} px={3}>
            <SettingHeader name="Advanced" />
            <Text fontSize="md" fontWeight={500} mt={-2} mb={4}>
              🐉 Changing these properties can cause you to lose all your data!!
            </Text>
            <Flex my={0.5} direction={'column'}>
              {Object.keys(settings).map((key, index) => {
                if (key === '__internal__') return;
                return (
                  <Flex
                    direction="row"
                    justifyContent="flex-start"
                    py={3}
                    px={0}
                    w="100%"
                    h="30px"
                    alignItems="center"
                  >
                    <Text fontSize="sm" w="180px" fontWeight="bold">
                      {camelCaseToInitialCaps(key)}
                    </Text>
                    {key === 'overrideDatabaseDirectory' && (
                      <>
                        <Text ml={3} fontSize="sm">
                          {settings[key]}
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

                            setSettings(
                              await window.electronAPI.ipcRenderer.getSettings()
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
                  Finish em will restart after chosing a new database directory
                </AlertDescription>
              </Alert>
            </Flex>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};
export default Settings;
