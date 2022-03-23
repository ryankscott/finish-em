import { Box, Flex } from '@chakra-ui/react';
import EditFilteredItemList from './EditFilteredItemList';

interface Props {
  componentKey: string;
  setEditing: (editing: boolean) => void;
}

const FailedFilteredItemList = ({ componentKey, setEditing }: Props) => {
  return (
    <Box
      m={0}
      p={0}
      w="100%"
      borderRadius={5}
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex
        direction="row"
        justifyContent="center"
        alignItems="center"
        m={0}
        py={3}
        px={2}
        w="100%"
        minH="50px"
        borderRadius={5}
        border="1px solid"
        borderColor="red.500"
        bg="red.500"
        color="gray.50"
        fontSize="md"
        fontWeight="semibold"
      >
        Failed to load component - please reconfigure
      </Flex>
      <Box>
        <EditFilteredItemList
          key={`dlg-${componentKey}`}
          componentKey={componentKey}
          onClose={() => {
            setEditing(false);
          }}
        />
      </Box>
    </Box>
  );
};

export default FailedFilteredItemList;
