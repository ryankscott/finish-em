import { Text, VStack } from '@chakra-ui/react';
import { ReactElement } from 'react';
import Page from './Page';

const Help = (): ReactElement => {
  return (
    <Page>
      <VStack w="100%" justifyContent="flex-start">
        <Text py={4} w="100%" fontSize="3xl" color="blue.500">
          Help
        </Text>
      </VStack>
    </Page>
  );
};

export default Help;
