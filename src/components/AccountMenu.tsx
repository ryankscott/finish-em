import {
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuGroup,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { Icons } from "../assets/icons";

function AccountMenu() {
  const navigate = useNavigate();
  return (
    <Menu>
      <MenuButton
        as={IconButton}
        w="32px"
        h="32px"
        variant="dark"
        aria-label="Account"
        icon={<Icon as={Icons["avatar"]} h={4} w={4} />}
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
