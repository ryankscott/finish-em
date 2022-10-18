import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  IconButton,
  Switch,
} from '@chakra-ui/react';
import { ReactElement, useEffect, useState } from 'react';
import { Icons } from 'renderer/assets/icons';
import { GET_COMPONENT_BY_KEY, UPDATE_COMPONENT } from 'renderer/queries';
import { Label, Project } from '../../main/generated/typescript-helpers';
import { ItemCreatorProps } from './ItemCreator';
import Select from './Select';

const Setting = (props: FlexProps) => (
  <Flex
    py={1}
    px={2}
    w="100%"
    minH="35px"
    alignItems="bottom"
    direction="row"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const SettingLabel = (props: FlexProps) => (
  <Flex
    alignSelf="flex-start"
    color="gray.800"
    fontSize="md"
    py={1}
    px={3}
    mr={3}
    w="160px"
    minW="160px"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const SettingValue = (props: FlexProps) => (
  <Flex
    justifyContent="center"
    py={0}
    px={2}
    w="100%"
    minH="30px"
    alignItems="flex-start"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

type EditItemCreatorProps = {
  componentKey: string;
  onClose: () => void;
};

const EditItemCreator = ({
  componentKey,
  onClose,
}: EditItemCreatorProps): ReactElement => {
  const [initiallyExpanded, setInitiallyExpanded] = useState(true);
  const [projectKey, setProjectKey] = useState<string | undefined>();
  const [labelKey, setLabelKey] = useState<string | undefined>();

  const [updateComponent] = useMutation(UPDATE_COMPONENT);
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: componentKey },
  });

  let params: ItemCreatorProps = { initiallyExpanded: false };
  useEffect(() => {
    if (loading === false && data) {
      setInitiallyExpanded(params.initiallyExpanded);
      setProjectKey(params.projectKey);
      setLabelKey(params.labelKey);
    }
  }, [
    loading,
    data,
    params.initiallyExpanded,
    params.projectKey,
    params.labelKey,
  ]);

  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }
  try {
    params = JSON.parse(data.component.parameters);
  } catch (err) {
    console.log('Failed to parse parameters');
    console.log(err);
    return <></>;
  }

  const generateProjectOptions = (
    projects: Project[]
  ): { value: string; label: string }[] => {
    return projects.map((p) => {
      return {
        value: p.key,
        label: p.name,
      };
    });
  };

  const generateLabelOptions = (
    labels: Label[]
  ): { value: string; label: string }[] => {
    return [
      ...labels.map((a) => {
        return {
          value: a.key,
          label: a.name ?? '',
        };
      }),
      { value: '', label: 'No label' },
    ];
  };

  const projectOptions = generateProjectOptions(data.projects);
  const labelOptions = generateLabelOptions(data.labels);
  return (
    <Flex
      border="1px solid"
      borderColor="gray.200"
      borderRadius="sm"
      direction="column"
      bg="gray.50"
      py={2}
      px={2}
      pb={4}
      w="100%"
    >
      <Flex direction="row" justifyContent="flex-end" p={2}>
        <Box>
          <IconButton
            aria-label="close"
            size="sm"
            variant="default"
            icon={<Icon as={Icons.close} />}
            onClick={() => {
              onClose();
            }}
          />
        </Box>
      </Flex>
      <Setting>
        <SettingLabel>Initially expanded:</SettingLabel>
        <SettingValue>
          <Switch
            size="sm"
            checked={initiallyExpanded}
            onChange={() => {
              setInitiallyExpanded(!initiallyExpanded);
            }}
          />
        </SettingValue>
      </Setting>
      <Setting>
        <SettingLabel>Project:</SettingLabel>
        <SettingValue>
          <Box position="relative" width="180px">
            <Select
              placeholder="Select project"
              defaultValue={projectOptions.find((p) => p.value === projectKey)}
              onChange={(p) => {
                setProjectKey(p.value);
              }}
              options={projectOptions}
              escapeClearsValue
            />
          </Box>
        </SettingValue>
      </Setting>
      <Setting>
        <SettingLabel>Label: </SettingLabel>
        <SettingValue>
          <Box position="relative" width="180px">
            <Select
              placeholder="Select label"
              defaultValue={labelOptions.find((l) => l.value === labelKey)}
              onChange={(l) => {
                setLabelKey(l.value);
              }}
              options={labelOptions}
              escapeClearsValue
            />
          </Box>
        </SettingValue>
      </Setting>
      <Flex
        position="relative"
        direction="row"
        justifyContent="flex-end"
        py={0}
        px={8}
        width="100%"
      >
        <Button
          size="md"
          variant="primary"
          rightIcon={<Icon as={Icons.save} />}
          onClick={() => {
            updateComponent({
              variables: {
                key: componentKey,
                parameters: {
                  initiallyExpanded,
                  projectKey,
                  labelKey,
                },
              },
            });
            onClose();
          }}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

export default EditItemCreator;
