import { Icon, IconButton, Tooltip } from "@chakra-ui/react";
import { Icons } from "../assets/icons";
import { AppState, useBoundStore } from "../state";
import { HEADERBAR_ICON_SIZE } from "./Headerbar";

const SidebarToggleButton = () => {
  const [sidebarVisible, setSidebarVisible] = useBoundStore(
    (state: AppState) => [state.sidebarVisible, state.setSidebarVisible]
  );
  return (
    <Tooltip label={"Toggle menu"}>
      <IconButton
        my={0}
        size="md"
        variant="dark"
        aria-label="Toggle sidebar"
        icon={
          sidebarVisible ? (
            <Icon
              as={Icons.close}
              w={HEADERBAR_ICON_SIZE}
              h={HEADERBAR_ICON_SIZE}
            />
          ) : (
            <Icon
              as={Icons.menu}
              w={HEADERBAR_ICON_SIZE}
              h={HEADERBAR_ICON_SIZE}
            />
          )
        }
        onClick={() => {
          setSidebarVisible(!sidebarVisible);
        }}
      />
    </Tooltip>
  );
};
export default SidebarToggleButton;
