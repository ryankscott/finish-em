import React, { ReactElement } from 'react';
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  Text,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { IconType } from '../interfaces';
import { Icons2 } from '../assets/icons';

export type MoreDropdownOptions = {
  label: string;
  icon: IconType;
  onClick: (e: React.MouseEvent) => void;
}[];

type MoreDropdownProps = {
  options: MoreDropdownOptions;
  showDialog?: boolean;
  disableClick?: boolean;
};

const MoreDropdown = ({
  options,
  showDialog,
  disableClick,
}: MoreDropdownProps): ReactElement => {
  const { colorMode } = useColorMode();

  return (
    <Menu matchWidth>
      <MenuButton
        as={IconButton}
        onClick={(e) => e.stopPropagation()}
        variant="subtle"
        color={colorMode === 'light' ? 'gray.800' : 'gray.400'}
        icon={<Icon as={Icons2.more} />}
      />
      <MenuList minW="140px">
        {options.map((v, i) => {
          return (
            <MenuItem borderRadius={5} w="140px" key={i} onClick={v.onClick}>
              <Flex
                direction="row"
                justifyContent="center"
                alignItems="center"
                py={0}
                px={2}
              >
                <Icon as={Icons2[v?.icon]} />
                <Text pl={2} fontSize="sm">
                  {v.label}
                </Text>
              </Flex>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
};

export default MoreDropdown;
