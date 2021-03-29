import React from 'react'

import { SkeletonCircle, Skeleton, Box } from '@chakra-ui/react'

export const LoadingItem = () => {
  return (
    <Box
      my={1}
      mx={0}
      w="100%"
      height="60px"
      borderRadius={3}
      position="relative"
      _after={{
        contnet: '',
        width: '100%',
        borderBottom: '1px solid',
        borderColor: 'gray.400',
        height: '1px',
        position: 'absolute',
        bottom: '0',
        right: '0',
        left: '0',
        margin: '0px auto',
      }}
    >
      <SkeletonCircle my={1} left="0px" position="absolute" top="0px" size={'6'} />
      <Skeleton
        my={1}
        mx={2}
        position="absolute"
        left="30px"
        width="calc(100% - 50px)"
        height="25px"
        top="0px"
      />
      <Skeleton
        my={1}
        mx={2}
        position="absolute"
        left="15%"
        width="120px"
        height="20px"
        bottom="0px"
      />
      <Skeleton
        my={1}
        mx={2}
        position="absolute"
        left="40%"
        width="120px"
        height="20px"
        bottom="0px"
      />
      <Skeleton
        my={1}
        mx={2}
        position="absolute"
        left="65%"
        width="120px"
        height="20px"
        bottom="0px"
      />
    </Box>
  )
}
