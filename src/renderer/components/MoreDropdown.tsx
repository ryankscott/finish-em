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
import { Icons } from '../assets/icons';

export type MoreDropdownOptions = {
  label: string;
  icon: IconType;
  onClick: (e: React.MouseEvent) => void;
}[];

type MoreDropdownProps = {
  options: MoreDropdownOptions;
  disableClick?: boolean;
};

const MoreDropdown = ({
  options,
  disableClick,
}: MoreDropdownProps): ReactElement => {
  const { colorMode } = useColorMode();

  return (
    <Menu matchWidth>
      <MenuButton
        disabled={disableClick}
        as={IconButton}
        onClick={(e) => e.stopPropagation()}
        variant="subtle"
        color={colorMode === 'light' ? 'gray.800' : 'gray.400'}
        icon={<Icon as={Icons.more} />}
      />
      <MenuList minW="140px">
        {options.map((v, i) => {
          return (
            <MenuItem borderRadius="md" w="140px" key={i} onClick={v.onClick}>
              <Flex
                direction="row"
                justifyContent="center"
                alignItems="center"
                py={0}
                px={2}
              >
                <Icon as={Icons[v?.icon]} />
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
