import { Flex, FlexProps } from "@chakra-ui/react";

const Page = ({ children }: FlexProps) => (
  <Flex
    mt={14}
    m={[1, 1, 5, 5]}
    p={[1, 1, 5, 5]}
    w="100%"
    direction="column"
    maxW="800px"
  >
    {children}
  </Flex>
);

export default Page;
