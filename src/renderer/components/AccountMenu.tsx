import {
  IconButton,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuGroup,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Icons } from 'renderer/assets/icons';

function AccountMenu() {
  const [user, setUser] = useState();

  useEffect(() => {
    const getUser = async () => {
      const user = await window.electronAPI.ipcRenderer.getSignedInUser();
      setUser(user);
    };
    getUser();
  }, []);

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        w="32px"
        h="32px"
        variant="dark"
        aria-label="Account"
        icon={<Icon as={Icons['avatar']} h={4} w={4} />}
      />

      <MenuList>
        <MenuGroup title={`${user?.email}`}>
          <MenuItem fontSize="sm" isDisabled onClick={async () => {}}>
            Log out
          </MenuItem>
        </MenuGroup>
      </MenuList>
    </Menu>
  );
}

export default AccountMenu;
