import { ReactElement } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { startCase } from 'lodash';
import {
  Box,
  Flex,
  Editable,
  EditableInput,
  EditablePreview,
  useColorMode,
} from '@chakra-ui/react';
import {
  GET_COMPONENT_BY_KEY,
  UPDATE_COMPONENT,
} from 'renderer/queries/component';
import Button from './Button';

import Select from './Select';
import { Icons } from '../assets/icons';

export type ViewHeaderProps = {
  componentKey: string;
  onClose: () => void;
};

const generateIconOptions = (): {
  value: string;
  label: string | JSX.Element;
}[] => {
  return Object.keys(Icons).map((i) => {
    return {
      value: i,
      label: (
        <Flex alignItems="center">
          <Flex pr={1} alignItems="center">
            {Icons[i](12, 12)}
          </Flex>
          {startCase(i)}
        </Flex>
      ),
    };
  });
};

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

const EditViewHeader = (props: ViewHeaderProps): ReactElement => {
  const { colorMode } = useColorMode();
  const [updateComponent] = useMutation(UPDATE_COMPONENT);
  const { loading, error, data } = useQuery(GET_COMPONENT_BY_KEY, {
    variables: { key: props.componentKey },
  });

  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  let params = { name: '' };
  try {
    params = JSON.parse(data.component.parameters);
  } catch (error) {
    console.log('Failed to parse parameters');
    console.log(error);
    return <></>;
  }

  const options = generateIconOptions();

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
          <Button
            size="sm"
            variant="default"
            iconSize="14"
            icon="close"
            onClick={() => {
              props.onClose();
            }}
          />
        </Box>
      </Flex>
      <Flex direction="row" {...settingStyles}>
        <Flex {...settingLabelStyles}>Name:</Flex>
        <Flex direction="column" {...settingValueStyles}>
          <Editable
            width="180px"
            defaultValue={params.name}
            fontSize="md"
            mx={2}
            w="100%"
            color="gray.700"
            onChange={(input) => {
              params.name = input;
            }}
          >
            <EditablePreview
              _hover={{
                bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
              }}
            />
            <EditableInput />
          </Editable>
        </Flex>
      </Flex>
      <Flex direction="row" {...settingStyles}>
        <Flex {...settingLabelStyles}>Icon:</Flex>
        <Flex direction="column" {...settingValueStyles}>
          <Box position="relative" width="180px">
            <Select
              size="md"
              placeholder="Select icon"
              defaultValue={options.find((o) => o.value == params.icon)}
              onChange={(i) => {
                params.icon = i.value;
              }}
              options={options}
              escapeClearsValue
              renderLabelAsElement
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
          text="Save"
          variant="primary"
          icon="save"
          onClick={() => {
            updateComponent({
              variables: {
                key: props.componentKey,
                parameters: { name: params.name, icon: params.icon },
              },
            });
            props.onClose();
          }}
        />
      </Flex>
    </Flex>
  );
};
export default EditViewHeader;
