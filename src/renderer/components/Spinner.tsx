import { ReactElement } from 'react';
import { Flex, Spinner as CSpinner } from '@chakra-ui/react';

const Spinner = (): ReactElement => {
  return (
    <Flex
      direction="row"
      justifyContent="center"
      alignContent="center"
      py={8}
      px={0}
    >
      <CSpinner color="blue.500" />
    </Flex>
  );
};
export default Spinner;
