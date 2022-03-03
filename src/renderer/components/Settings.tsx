import { gql, useMutation, useQuery } from '@apollo/client';
import React, { ReactElement, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import colormap from 'colormap';
import { HexColorPicker } from 'react-colorful';
import {
  Box,
  Flex,
  Text,
  Switch,
  useColorMode,
  Editable,
  EditableInput,
  EditablePreview,
  useOutsideClick,
} from '@chakra-ui/react';
import {
  CREATE_LABEL,
  DELETE_LABEL,
  FeaturesAndLabels,
  GET_FEATURES_AND_LABELS,
  RECOLOUR_LABEL,
  RENAME_LABEL,
  SET_ACTIVE_CALENDAR,
  SET_FEATURE,
  SET_FEATURE_METADATA,
} from 'renderer/queries';
import { Calendar, Label } from 'main/generated/typescript-helpers';
import Select from './Select';
import { camelCaseToInitialCaps } from '../utils';
import Button from './Button';

const NUMBER_OF_COLOURS = 12;

const SidebarHeader = (props: {
  name: string;
  colorMode: 'light' | 'dark';
  isActive: boolean;
  onClick: () => void;
}) => (
  <Text
    fontSize="md"
    fontWeight="regular"
    py={2}
    px={6}
    m={0}
    cursor="pointer"
    bg={
      props.isActive
        ? props.colorMode == 'light'
          ? 'gray.200'
          : 'gray.900'
        : props.colorMode == 'light'
        ? 'gray.50'
        : 'gray.800'
    }
    onClick={() => {
      props.onClick();
    }}
  >
    {props.name}
  </Text>
);

const SettingHeader = (props: { name: string }): JSX.Element => (
  <Text py={4} px={0} fontSize="xl" fontWeight="semibold">
    {props.name}
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
  const ref = React.createRef<HTMLDivElement>();
  const [showColourPicker, setShowColourPicker] = useState<boolean>(false);
  const [colourPickerTriggeredBy, setColourPickerTriggeredBy] =
    useState<Label>();
  const [activeCategory, setActiveCategory] = useState('UI');

  useOutsideClick({
    ref,
    handler: () => {
      setShowColourPicker(false);
    },
  });

  const { loading, error, data } = useQuery<FeaturesAndLabels>(
    GET_FEATURES_AND_LABELS
  );
  const [setActiveCalendar] = useMutation(SET_ACTIVE_CALENDAR);
  const [setFeature] = useMutation(SET_FEATURE, {
    refetchQueries: ['getActiveCalendar'],
  });
  const [setFeatureMetadata] = useMutation(SET_FEATURE_METADATA);
  const [renameLabel] = useMutation(RENAME_LABEL, {
    refetchQueries: ['settings'],
  });
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
          name="User Interface"
          colorMode={colorMode}
          isActive={activeCategory === 'UI'}
          onClick={() => setActiveCategory('UI')}
        />
        <SidebarHeader
          name="Labels"
          colorMode={colorMode}
          isActive={activeCategory == 'LABELS'}
          onClick={() => setActiveCategory('LABELS')}
        />
      </Flex>
      <Flex position="relative" direction="column" p={2} w="100%">
        {activeCategory === 'UI' && (
          <Box p={3} my={6} px={3}>
            <SettingHeader name="User Interface" />
            {data.features.map((feature) => {
              return (
                <span key={`${feature.key}-container`}>
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
                        window.electron.ipcRenderer.sendMessage(
                          'feature-toggled',
                          {
                            name: feature.name,
                            key: feature.key,
                            enabled: !feature.enabled,
                            metadata: feature.metadata,
                          }
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
                            (c) => c.value == data?.activeCalendar?.key
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
                    {feature.name == 'bearNotesIntegration' && (
                      <Box pl={3} w="180px">
                        <Editable
                          defaultValue={JSON.parse(feature?.metadata)?.apiToken}
                          onSubmit={(val) => {
                            // @ts-ignore
                            window.electron.ipcRenderer.sendMessage(
                              'feature-metadata-updated',
                              {
                                name: feature.name,
                                key: feature.key,
                                enabled: feature.enabled,
                                metadata: { apiToken: val },
                              }
                            );
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
                </span>
              );
            })}
          </Box>
        )}
        {activeCategory == 'LABELS' && (
          <Box p={3} my={6} px={3}>
            <SettingHeader name="Labels" />
            {Object.values(data.labels).map((label: Label) => {
              return (
                <div id={label.key} key={`f-${label.key}`}>
                  <Flex
                    w="250px"
                    justifyContent="space-between"
                    alignItems="center"
                    height="auto"
                    bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
                    key={`lc-${label.key}`}
                  >
                    <Box w="100%" mr={1}>
                      <Editable
                        borderRadius="md"
                        borderColor="gray.50"
                        defaultValue={label.name ?? 'Label'}
                        fontSize="sm"
                        w="100%"
                        onBlur={(e) => {
                          renameLabel({
                            // @ts-ignore
                            variables: { key: label.key, name: e.target.value },
                          });
                        }}
                        onSubmit={(input) => {
                          renameLabel({
                            variables: { key: label.key, name: input },
                          });
                        }}
                        submitOnBlur={false}
                      >
                        <EditablePreview
                          fontSize="sm"
                          _hover={{
                            bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
                          }}
                        />
                        <EditableInput />
                      </Editable>
                    </Box>
                    <Flex
                      bg={label.colour ?? '#000'}
                      cursor="pointer"
                      width="30px"
                      height="24px"
                      borderRadius="md"
                      borderWidth="3px"
                      borderColor="white"
                      shadow="md"
                      id={`${label.key}-edit`}
                      key={`edit-colour-${label.key}`}
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        setShowColourPicker(!showColourPicker);
                        setColourPickerTriggeredBy(label);
                        e.stopPropagation();
                      }}
                    />
                    <Button
                      id={`${label.key}-delete`}
                      key={`delete-label-${label.key}`}
                      icon="trash"
                      iconSize="18px"
                      size="sm"
                      variant="default"
                      onClick={() => {
                        deleteLabel({ variables: { key: label.key } });
                      }}
                    />
                  </Flex>
                </div>
              );
            })}
            {showColourPicker && (
              <Flex w="200px" ref={ref} postion="absolute" zIndex={99}>
                <HexColorPicker
                  color={colourPickerTriggeredBy?.colour ?? '#000'}
                  onChange={(colour) => {
                    setColourOfLabel({
                      variables: {
                        key: colourPickerTriggeredBy?.key,
                        colour,
                      },
                    });
                  }}
                />
              </Flex>
            )}
            <Flex w="185px" justifyContent="center" pt={3}>
              <Button
                variant="default"
                size="md"
                icon="add"
                text="Add label"
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
                iconPosition="right"
                iconSize="12px"
              />
            </Flex>
          </Box>
        )}
      </Flex>
    </Flex>
  );
};
export default Settings;
