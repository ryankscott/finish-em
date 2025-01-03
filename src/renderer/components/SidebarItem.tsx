import { Flex, Icon, Text, Tooltip } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IconType } from "../interfaces";
import { Icons } from "../assets/icons";
import { createShortSidebarItem } from "../utils";
import EmojiDisplay from "./EmojiDisplay";
import { AppState, useBoundStore } from "../state";

type SidebarItemProps = {
  variant: "defaultView" | "customView";
  type: "area" | "project";
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
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);
  const [sidebarVisible] = useBoundStore((state: AppState) => [
    state.sidebarVisible,
  ]);

  useEffect(() => {
    setIsActive(location.pathname.includes(path));
  }, [location, path]);

  if (sidebarVisible) {
    return (
      <Tooltip label={text}>
        <Flex
          w={"100%"}
          my={type === "area" ? 0.5 : 0.25}
          mx={1}
          px={2}
          py={1.5}
          borderRadius="md"
          justifyContent="flex-start"
          alignItems="center"
          cursor="pointer"
          bg={isActive ? "gray.200" : "inherit"}
          _hover={{
            bg: "gray.200",
          }}
          _focus={{
            outlineColor: "blue.700",
            border: "none",
            bg: "gray.200",
          }}
          onClick={() => {
            navigate(path);
          }}
        >
          {variant === "defaultView" && iconName && (
            <Icon as={Icons[iconName]} color={"black"} />
          )}
          {variant === "customView" && emoji && (
            <EmojiDisplay emojiId={emoji} size={14} />
          )}
          <Text
            p={0}
            pl={2}
            m={0}
            color="gray.800"
            fontSize={type === "area" ? "sm" : "md"}
            fontWeight={type === "area" ? "semibold" : "normal"}
            textTransform={type === "area" ? "uppercase" : "none"}
          >
            {text}
          </Text>
        </Flex>
      </Tooltip>
    );
  }

  return (
    <Tooltip label={text}>
      <Flex
        my={0.5}
        mx={0}
        px={0}
        py={1.5}
        borderRadius="md"
        alignItems="center"
        bg={isActive ? "gray.200" : "gray.100"}
        _hover={{
          bg: "gray.200",
        }}
        _focus={{
          outlineColor: "blue.700",
          border: "none",
          bg: "gray.200",
        }}
        justifyContent="center"
        cursor="pointer"
        onClick={() => {
          navigate(path);
        }}
        w="100%"
      >
        {variant === "defaultView" && iconName && (
          <Icon as={Icons[iconName]} color="black" />
        )}
        {variant === "customView" && emoji && (
          <EmojiDisplay emojiId={emoji} size={16} />
        )}
        {variant === "customView" && !emoji && (
          <Text textAlign="center" fontSize="md" color="gray.800">
            {createShortSidebarItem(text)}
          </Text>
        )}
      </Flex>
    </Tooltip>
  );
};
SidebarItem.whyDidYouRender = true;
export default SidebarItem;
