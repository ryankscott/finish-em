import { Flex, Image, Text } from '@chakra-ui/react';
import icon from '../assets/finish_em.svg';
const CloudIcon = () => (
  <Flex w="100%" alignItems="center" direction="column">
    <Image src={icon} w="60px" h="60px" />
    <Text fontSize="2xl" fontWeight="bold">
      Finish Em Cloud
    </Text>
  </Flex>
);

export default CloudIcon;
