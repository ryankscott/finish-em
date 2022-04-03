import { chakra, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Emoji } from 'emoji-mart';
import { NavLink } from 'react-router-dom';
import { IconType } from 'renderer/interfaces';
import { Icons } from '../assets/icons';
import { createShortSidebarItem } from '../utils';

type SidebarItemProps = {
  variant: 'defaultView' | 'customView';
  sidebarVisible: boolean;
  path: string;
  text: string;
  activeColour: string;
  iconName?: IconType;
  emoji?: string;
};

export const SidebarItem = ({
  variant,
  sidebarVisible,
  path,
  text,
  activeColour,
  iconName,
  emoji,
}: SidebarItemProps): React.ReactElement => {
  const StyledLink = chakra(NavLink);
  const linkStyles = {
    color: 'gray.100',
    w: '100%',
    borderRadius: 4,
    py: 1.25,
    m: 0,
    my: 0.25,
    px: sidebarVisible ? 1 : 0,
    _focus: {
      outlineColor: 'blue.500',
      border: 'none',
      bg: 'gray.900',
    },
    _hover: {
      bg: 'gray.900',
    },
    _active: {
      bg: 'gray.900',
    },
  };

  if (sidebarVisible) {
    return (
      <Tooltip label={text}>
        <StyledLink
          activeStyle={{
            backgroundColour: activeColour,
          }}
          {...linkStyles}
          to={path}
        >
          <Flex
            key={uuidv4()}
            focusBorderColor="blue.500"
            m={0}
            px={2}
            py={0}
            justifyContent="flex-start"
            alignItems="center"
          >
            {variant === 'defaultView' && iconName && (
              <Icon as={Icons[iconName]} />
            )}
            {variant === 'customView' && emoji && (
              <Emoji emoji={emoji} size={14} native />
            )}
            <Text
              key={uuidv4()}
              p={0}
              pl={1}
              m={0}
              color="gray.100"
              fontSize="md"
            >
              {text}
            </Text>
          </Flex>
        </StyledLink>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={text}>
      <StyledLink
        activeStyle={{
          backgroundColour: activeColour,
        }}
        {...linkStyles}
        to={path}
      >
        <Flex justifyContent="center">
          {variant === 'defaultView' && iconName && (
            <Icon as={Icons[iconName]} />
          )}
          {variant === 'customView' && emoji && (
            <Emoji emoji={emoji} size={16} native />
          )}
          {variant === 'customView' && !emoji && (
            <Text textAlign="center" fontSize="md" color="gray.100">
              {createShortSidebarItem(text)}
            </Text>
          )}
        </Flex>
      </StyledLink>
    </Tooltip>
  );
};
export default SidebarItem;
