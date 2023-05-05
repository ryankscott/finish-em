import { Flex, FlexProps } from "@chakra-ui/react";

const Page = ({ children }: FlexProps) => (
  <Flex
    mt={14}
    m={[2, 2, 5, 5]}
    px={[2, 2, 5, 5]}
    py={5}
    w="100%"
    direction="column"
    maxW="800px"
  >
    {children}
  </Flex>
);

export default Page;
