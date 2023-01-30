import { ReactElement } from 'react';
import { Flex, Spinner as CSpinner } from '@chakra-ui/react';

const Spinner = (): ReactElement => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      h="100%"
    >
      <CSpinner color="blue.500" />
    </Flex>
  );
};
export default Spinner;
