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
  type: 'area' | 'project';
  sidebarVisible: boolean;
  path: string;
  text: string;
  iconName?: IconType;
  emoji?: string;
};

const SidebarItem = ({
  variant,
  sidebarVisible,
  path,
  text,
  iconName,
  emoji,
  type,
}: SidebarItemProps): React.ReactElement => {
  const linkStyles = {
    color: 'gray.100',
    w: '100%',
    m: 0,
    p: 0,
  };
  const StyledLink = chakra(NavLink, { baseStyle: linkStyles });
  const isActive = window.location.pathname.includes(path);
  if (sidebarVisible) {
    return (
      <Tooltip label={text}>
        <StyledLink to={path}>
          <Flex
            key={uuidv4()}
            my={type === 'area' ? 0.5 : 0.25}
            mx={1}
            px={sidebarVisible ? 2 : 0}
            py={1.5}
            borderRadius="md"
            justifyContent="flex-start"
            alignItems="center"
            bg={isActive ? 'gray.900' : 'inherit'}
            _hover={{
              bg: 'gray.900',
            }}
            _focus={{
              outlineColor: 'blue.500',
              border: 'none',
              bg: 'gray.900',
            }}
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
              pl={2}
              m={0}
              color="gray.100"
              fontSize={type === 'area' ? 'sm' : 'md'}
              fontWeight={type === 'area' ? 'semibold' : 'normal'}
              textTransform={type === 'area' ? 'uppercase' : 'none'}
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
      <StyledLink to={path}>
        <Flex
          key={uuidv4()}
          my={0.5}
          mx={1}
          px={sidebarVisible ? 2 : 0}
          py={1.5}
          borderRadius="md"
          alignItems="center"
          bg={isActive ? 'gray.900' : 'gray.800'}
          _hover={{
            bg: 'gray.900',
          }}
          _focus={{
            outlineColor: 'blue.500',
            border: 'none',
            bg: 'gray.900',
          }}
          justifyContent="center"
        >
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
