import { chakra, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconType } from '../interfaces';
import { Icons } from '../assets/icons';
import { createShortSidebarItem } from '../utils';
import EmojiDisplay from './EmojiDisplay';
import { AppState, useAppStore } from 'renderer/state';

type SidebarItemProps = {
  variant: 'defaultView' | 'customView';
  type: 'area' | 'project';
  path: string;
  text: string;
  iconName?: IconType;
  emoji?: string;
};

const SidebarItem = ({
  variant,
  path,
  text,
  iconName,
  emoji,
  type,
}: SidebarItemProps): React.ReactElement => {
  const [sidebarVisible] = useAppStore((state: AppState) => [
    state.sidebarVisible,
  ]);
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
              <EmojiDisplay emojiId={emoji} size={14} />
            )}
            <Text
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
            <EmojiDisplay emojiId={emoji} size={16} />
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
