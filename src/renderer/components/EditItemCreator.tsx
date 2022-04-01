import { useMutation, useQuery } from '@apollo/client';
import { Box, Button, Flex, Icon, IconButton, Switch } from '@chakra-ui/react';
import { ReactElement, useEffect, useState } from 'react';
import { Icons2 } from 'renderer/assets/icons';
import { GET_COMPONENT_BY_KEY, UPDATE_COMPONENT } from 'renderer/queries';
import { Label, Project } from '../../main/generated/typescript-helpers';
import { ItemCreatorProps } from './ItemCreator';
import Select from './Select';

// TODO: turn these into variants
const settingStyles = {
  justifyContent: 'flex-start',
  py: 1,
  px: 2,
  w: '100%',
  minH: '35px',
  alignItems: 'bottom',
};

const settingLabelStyles = {
  display: 'flex',
  alignSelf: 'flex-start',
  color: 'gray.800',
  fontSize: 'md',
  py: 1,
  px: 3,
  mr: 3,
  w: '160px',
  minW: '160px',
};

const settingValueStyles = {
  display: 'flex',
  justifyContent: 'center',
  py: 0,
  px: 2,
  width: '100%',
  minH: '30px',
  alignItems: 'flex-start',
};

type EditItemCreatorProps = {
  componentKey: string;
  onClose: () => void;
};

const EditItemCreator = (props: EditItemCreatorProps): ReactElement => {
  const [initiallyExpanded, setInitiallyExpanded] = useState(true);
  const [projectKey, setProjectKey] = useState('');
  const [labelKey, setLabelKey] = useState('');

  const [updateComponent] = useMutation(UPDATE_COMPONENT);
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  });
  useEffect(() => {
    if (loading === false && data) {
      setInitiallyExpanded(params.initiallyExpanded);
      setProjectKey(params.projectKey);
      setLabelKey(params.labelKey);
    }
  }, [loading, data]);

  if (loading) return null;
  if (error) {
    console.log(error);
    return null;
  }
  let params: ItemCreatorProps = { initiallyExpanded: false };
  try {
    params = JSON.parse(data.component.parameters);
  } catch (error) {
    console.log('Failed to parse parameters');
    console.log(error);
    return null;
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
          label: a.name,
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
      borderRadius={3}
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
            icon={<Icon as={Icons2.close} />}
            onClick={() => {
              props.onClose();
            }}
          />
        </Box>
      </Flex>
      <Flex direction="row" {...settingStyles}>
        <Flex {...settingLabelStyles}>Initially expanded:</Flex>
        <Flex direction="column" {...settingValueStyles}>
          <Switch
            size="sm"
            checked={initiallyExpanded}
            onChange={() => {
              setInitiallyExpanded(!initiallyExpanded);
            }}
          />
        </Flex>
      </Flex>
      <Flex direction="row" {...settingStyles}>
        <Flex {...settingLabelStyles}>Project:</Flex>
        <Flex direction="column" {...settingValueStyles}>
          <Box position="relative" width="180px">
            <Select
              size="md"
              placeholder="Select project"
              defaultValue={projectOptions.find((p) => p.value === projectKey)}
              onChange={(p) => {
                setProjectKey(p.value);
              }}
              options={projectOptions}
              escapeClearsValue
            />
          </Box>
        </Flex>
      </Flex>
      <Flex direction="row" {...settingStyles}>
        <Flex {...settingLabelStyles}>Label: </Flex>
        <Flex direction="column" {...settingValueStyles}>
          <Box position="relative" width="180px">
            <Select
              size="md"
              placeholder="Select label"
              defaultValue={labelOptions.find((l) => l.value === labelKey)}
              onChange={(l) => {
                setLabelKey(l.value);
              }}
              options={labelOptions}
              escapeClearsValue
            />
          </Box>
        </Flex>
      </Flex>
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
          rightIcon={<Icon as={Icons2.save} />}
          onClick={() => {
            updateComponent({
              variables: {
                key: props.componentKey,
                parameters: {
                  initiallyExpanded,
                  projectKey,
                  labelKey,
                },
              },
            });
            props.onClose();
          }}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

export default EditItemCreator;
