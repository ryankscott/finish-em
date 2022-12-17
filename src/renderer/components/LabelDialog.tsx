import { useMutation, useQuery } from '@apollo/client';
import { Flex, Text } from '@chakra-ui/layout';
import { useColorMode } from '@chakra-ui/react';
import { Label } from 'main/resolvers-types';
import { ReactElement } from 'react';
import { ITEM_BY_KEY, SET_LABEL } from '../queries';
import { GET_LABELS } from '../queries/label';

type LabelDialogProps = {
  itemKey: string;
  onClose: () => void;
};
function LabelDialog({ itemKey, onClose }: LabelDialogProps): ReactElement {
  const { colorMode } = useColorMode();
  const [setLabel] = useMutation(SET_LABEL, { refetchQueries: [ITEM_BY_KEY] });

  const { loading, error, data } = useQuery(GET_LABELS);
  if (loading) return <></>;

  if (error) {
    console.log(error);
    return <></>;
  }

  const labels = [...data?.labels, { name: 'No label', key: null }];

  return (
    <Flex
      direction="column"
      zIndex={2}
      position="absolute"
      minW="180px"
      right="0px"
      top="0px"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.800'}
      borderRadius="md"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
    >
      <Flex direction="column" py={2} px={0}>
        {labels.map((m: Label) => {
          return (
            <Flex
              px={3}
              py={0.5}
              my={0.5}
              key={m.key}
              justifyContent="space-between"
              alignItems="center"
              _hover={{
                bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
              }}
              onClick={() => {
                setLabel({
                  variables: { key: itemKey, labelKey: m.key },
                });
                onClose();
              }}
            >
              <Text fontSize="sm">{m.name}</Text>
              <Flex
                bg={m.colour ?? '#000'}
                borderRadius="50%"
                cursor="pointer"
                width="24px"
                height="24px"
                borderWidth="3px"
                borderColor="gray.200"
                id={`${m.key}-edit`}
                key={`edit-colour-${m.key}`}
              />
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

export default LabelDialog;
