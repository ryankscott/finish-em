import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
} from '@chakra-ui/react';

const OfflineStatus = () => (
  <Flex w="100%" h="100vh" justifyContent="center" alignItems="center">
    <Flex opacity={0.6} h="100vh">
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

      <Flex
        zIndex={50}
        direction="column"
        justifyContent="space-between"
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
    </Flex>
    <Flex w="100%" justifyContent="center">
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
        maxW="400px"
        borderRadius="md"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Currently offline
        </AlertTitle>
        <AlertDescription maxWidth="sm" fontSize="lg">
          You are currently disconnected from the internet. Please reconnect to
          continue to use Finish-em
        </AlertDescription>
      </Alert>
    </Flex>
  </Flex>
);

export default OfflineStatus;
