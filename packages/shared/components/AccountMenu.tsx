import {
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Icons } from "../assets/icons";
import { HEADERBAR_ICON_SIZE } from "./Headerbar";

// TODO: Store the logged in user details and show in the menu
function AccountMenu() {
  return (
    <Menu variant="dark">
      <MenuButton
        as={IconButton}
        w="32px"
        h="32px"
        variant="dark"
        aria-label="Account"
        icon={
          <Icon
            as={Icons["avatar"]}
            h={HEADERBAR_ICON_SIZE}
            w={HEADERBAR_ICON_SIZE}
          />
        }
      />

      <MenuList>
        <MenuGroup>
          <MenuItem
            fontSize="sm"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            Log out
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
}

export default AccountMenu;
