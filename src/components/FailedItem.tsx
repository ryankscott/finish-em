import { Flex, Text } from '@chakra-ui/react';

interface FailedItemPropTypes {
  reason?: string;
}

const FailedItem = ({ reason }: FailedItemPropTypes) => (
  <Flex
    w="100%"
    p={1}
    mx={0}
    minH="40px"
    alignItems="center"
    cursor="pointer"
    borderRadius="md"
    alignContent="center"
    justifyContent="center"
    bg="red.100"
    borderColor="red.400"
  >
    <Text fontSize="md" color="red.500">
      Failed to load item {reason ? `- ${reason}` : ''}
    </Text>
  </Flex>
);

export { FailedItem };
