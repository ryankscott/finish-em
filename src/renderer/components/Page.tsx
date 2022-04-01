import { Flex, FlexProps, forwardRef } from '@chakra-ui/react';

const Page = forwardRef<FlexProps, 'div'>((props) => (
  <Flex mt={14} m={5} p={5} w="100%" direction="column" maxW="800px">
    {props.children}
  </Flex>
));

export default Page;
