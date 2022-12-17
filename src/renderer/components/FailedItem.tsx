import { Flex, Text } from '@chakra-ui/react';

interface FailedItemPropTypes {
  reason?: string;
}

const FailedItem = ({ reason }: FailedItemPropTypes) => (
  <Flex
    w="100%"
    p={1}
    mx={0}
    my={1}
    alignItems="center"
    cursor="pointer"
    borderRadius="md"
    alignContent="center"
    justifyContent="center"
    bg="red.100"
    border="1px solid"
    borderColor="red.400"
  >
    <Text fontSize="md" color="red.500">
      r Failed to load item - ${reason}
    </Text>
  </Flex>
);

export { FailedItem };
