import { Flex, IconButton, Icon } from "@chakra-ui/react";
import { Icons } from "../assets/icons";
import { v4 as uuidv4 } from "uuid";
import { AppState, useBoundStore } from "../state";

const SidebarToggleButton = () => {
  const [sidebarVisible, setSidebarVisible] = useBoundStore(
    (state: AppState) => [state.sidebarVisible, state.setSidebarVisible]
  );
  return (
    <Flex
      position="absolute"
      bottom="5px"
      left={sidebarVisible ? "227px" : "37px"}
      key={uuidv4()}
      justifyContent="center"
      alignItems="center"
    >
      <IconButton
        colorScheme="blue"
        aria-label="Toggle sidebar"
        borderRadius="50%"
        shadow="md"
        key={uuidv4()}
        icon={<Icon as={sidebarVisible ? Icons.slideLeft : Icons.slideRight} />}
        size="sm"
        transition="all 0.2s ease-in-out"
        onClick={() => {
          setSidebarVisible(!sidebarVisible);
        }}
      />
    </Flex>
  );
};
export default SidebarToggleButton;
