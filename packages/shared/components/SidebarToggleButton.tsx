import { IconButton, Flex } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { AppState, useBoundStore } from "../state";
import { ArrowRightIcon, ArrowLeftIcon } from "@chakra-ui/icons";

const SidebarToggleButton = () => {
  const [sidebarVisible, setSidebarVisible] = useBoundStore(
    (state: AppState) => [state.sidebarVisible, state.setSidebarVisible]
  );
  return (
    <Flex w="100%" justifyContent={sidebarVisible ? "flex-end" : "center"}>
      <IconButton
        my={0}
        size="lg"
        colorScheme={"black"}
        aria-label="Toggle sidebar"
        key={uuidv4()}
        icon={
          sidebarVisible ? (
            <ArrowLeftIcon boxSize={2} />
          ) : (
            <ArrowRightIcon boxSize={2} />
          )
        }
        onClick={() => {
          setSidebarVisible(!sidebarVisible);
        }}
      />
    </Flex>
  );
};
export default SidebarToggleButton;
