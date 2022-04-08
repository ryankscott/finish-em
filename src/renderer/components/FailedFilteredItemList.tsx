import { Box, Flex, Text } from '@chakra-ui/react';
import EditFilteredItemList from './EditFilteredItemList';

interface Props {
  componentKey: string;
  setEditing: (editing: boolean) => void;
}

const FailedFilteredItemList = ({ componentKey, setEditing }: Props) => {
  return (
    <Flex
      direction="column"
      justifyContent="center"
      alignItems="center"
      m={0}
      w="100%"
    >
      <Flex
        bg="red.100"
        w="100%"
        justifyContent="center"
        alignItems="center"
        border="1px solid"
        borderColor="red.200"
      >
        <Text fontSize="sm" fontWeight="medium" color="gray.700" py={3}>
          Failed to load component - please reconfigure
        </Text>
      </Flex>
      <EditFilteredItemList
        key={`dlg-${componentKey}`}
        componentKey={componentKey}
        onClose={() => {
          setEditing(false);
        }}
      />
    </Flex>
  );
};

export default FailedFilteredItemList;
