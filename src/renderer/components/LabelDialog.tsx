import { useMutation, useQuery } from '@apollo/client';
import { Box, Flex, Text } from '@chakra-ui/layout';
import { IconButton, Icon } from '@chakra-ui/react';
import { transparentize } from 'polished';
import { ReactElement } from 'react';
import { Icons } from 'renderer/assets/icons';
import { SET_LABEL } from 'renderer/queries';
import { GET_LABELS } from 'renderer/queries/label';
import { Label } from '../../main/generated/typescript-helpers';

type LabelDialogProps = {
  itemKey: string;
  onClose: () => void;
};
function LabelDialog({ itemKey, onClose }: LabelDialogProps): ReactElement {
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
      borderRadius="md"
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
        <IconButton
          aria-label="close"
          variant="default"
          size="sm"
          onClick={() => {
            onClose();
          }}
          icon={<Icon as={Icons.close} />}
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
                    variables: { key: itemKey, labelKey: m.key },
                  });
                  onClose();
                }}
              >
                <Text
                  fontSize="xs"
                  color={m.colour ?? 'black'}
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
              setLabel({ variables: { key: itemKey, labelKey: null } });
              e.stopPropagation();
              onClose();
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
