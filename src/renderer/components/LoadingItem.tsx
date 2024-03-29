import { SkeletonCircle, Skeleton, Box, useColorMode } from '@chakra-ui/react';

const LoadingItem = () => {
  const { colorMode } = useColorMode();
  return (
    <Box
      my={1}
      mx={0}
      px={2}
      w="100%"
      height="60px"
      borderRadius="md"
      position="relative"
      _after={{
        width: '100%',
        borderBottom: '1px solid',
        borderColor: colorMode === 'light' ? 'gray.400' : 'gray.600',
        height: '1px',
        position: 'absolute',
        bottom: '0',
        right: '0',
        left: '0',
        margin: '0px auto',
      }}
    >
      <SkeletonCircle
        startColor={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        my={1}
        left="0px"
        position="absolute"
        top="0px"
        size="6"
      />
      <Skeleton
        startColor={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        my={1}
        mx={2}
        position="absolute"
        left="30px"
        width="calc(100% - 50px)"
        height="25px"
        top="0px"
      />
      <Skeleton
        startColor={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        my={1}
        mx={2}
        position="absolute"
        left="15%"
        width="120px"
        height="20px"
        bottom="0px"
      />
      <Skeleton
        startColor={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        my={1}
        mx={2}
        position="absolute"
        left="40%"
        width="120px"
        height="20px"
        bottom="0px"
      />
      <Skeleton
        startColor={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        endColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        my={1}
        mx={2}
        position="absolute"
        left="65%"
        width="120px"
        height="20px"
        bottom="0px"
      />
    </Box>
  );
};
export default LoadingItem;
