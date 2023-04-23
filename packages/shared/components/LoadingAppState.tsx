import { Box, Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react';

const LoadingAppState = () => (
  <Flex w="100%" h="100vh" justifyContent="center" alignItems="center">
    <Box
      top="0"
      position="absolute"
      w="100%"
      color="gray.50"
      bg="gray.800"
      h="50px"
      shadow="md"
      zIndex={999}
    />

    <Box
      zIndex={50}
      w={'250px'}
      minW={'250px'}
      height="100%"
      py={2}
      px={2}
      bg="gray.800"
      shadow="lg"
      m={0}
      overflowY="scroll"
      border="none"
      borderRight="1px solid"
      borderColor={'gray.900'}
    />
    <Flex w="100%" justifyContent="center">
      <Flex maxW="600px" direction="column" justifyContent="center" w="100%">
        <Skeleton h="40px" w="100%" mb={4} />
        <Flex w="100%">
          <Skeleton h="40px" minWidth="40px" mr={2} />
          <Skeleton h="40px" w="100%" />
        </Flex>
        <Skeleton h="400px" w="100%" my={4} />
      </Flex>
    </Flex>
  </Flex>
);

export default LoadingAppState;
