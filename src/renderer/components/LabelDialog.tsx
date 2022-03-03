import { gql, useMutation, useQuery } from '@apollo/client';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { transparentize } from 'polished';
import { ReactElement } from 'react';
import { Label } from '../../main/generated/typescript-helpers';
import Button from './Button';

const GET_LABELS = gql`
  query {
    labels {
      key
      name
      colour
    }
  }
`;

const SET_LABEL = gql`
  mutation SetLabelOfItem($key: String!, $labelKey: String) {
    setLabelOfItem(input: { key: $key, labelKey: $labelKey }) {
      key
      label {
        key
      }
    }
  }
`;

type LabelDialogProps = {
  itemKey: string;
  onClose: () => void;
};
function LabelDialog(props: LabelDialogProps): ReactElement {
  const [setLabel] = useMutation(SET_LABEL);
  const { loading, error, data } = useQuery(GET_LABELS);
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  return (
    <Box
      zIndex={2}
      position="absolute"
      minW="180px"
      right="144px"
      top="36px"
      border="1px solid"
      borderColor="gray.200"
      borderRadius={4}
      padding={1}
      bg="gray.50"
    >
      <Flex
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
        pb={1}
      >
        <Text pl={2}>Labels</Text>
        <Button
          variant="default"
          size="sm"
          iconSize="12px"
          onClick={() => {
            props.onClose();
          }}
          icon="close"
        />
      </Flex>
      <Flex direction="column" py={2} px={1}>
        {data.labels.map((m: Label) => {
          return (
            <div key={m.key}>
              <Flex
                key={`lc-${m.key}`}
                justifyContent="space-between"
                alignItems="center"
                height="25px"
                bg={m.colour ? transparentize(0.8, m.colour) : 'gray.50'}
                _hover={{
                  fontWeight: 'semibold',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setLabel({
                    variables: { key: props.itemKey, labelKey: m.key },
                  });
                  props.onClose();
                }}
              >
                <Text
                  fontSize="xs"
                  color={m.colour}
                  p={1}
                  pl={4}
                  _hover={{
                    fontWeight: 'semibold',
                    cursor: 'pointer',
                  }}
                >
                  {m.name}
                </Text>
              </Flex>
            </div>
          );
        })}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          height="25px"
          bg="gray.50"
          _hover={{
            fontWeight: 'semibold',
            cursor: 'pointer',
          }}
        >
          <Text
            fontSize="xs"
            w="100%"
            bg="gray.100"
            p={1}
            pl={4}
            _hover={{
              fontWeight: 'semibold',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              setLabel({ variables: { key: props.itemKey, labelKey: null } });
              e.stopPropagation();
              props.onClose();
            }}
          >
            No label
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}

export default LabelDialog;
