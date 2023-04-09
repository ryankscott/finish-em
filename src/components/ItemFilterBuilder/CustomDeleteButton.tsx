import { ActionProps } from "react-querybuilder";
import { Flex, Icon, IconButton, useColorMode } from "@chakra-ui/react";
import { Icons } from "../../assets/icons";

const CustomDeleteButton = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => {
  const { colorMode } = useColorMode();
  return (
    <Flex position="absolute" top="0px" right="0px" justifyContent="flex-end">
      <IconButton
        aria-label="delete"
        color={colorMode === "light" ? "gray.800" : "gray.50"}
        bg={"transparent"}
        _hover={{
          color: colorMode === "light" ? "gray.800" : "gray.50",
          bg: "transparent",
        }}
        icon={<Icon as={Icons.close} />}
        onClick={(e) => handleOnClick(e)}
        size="sm"
        ml={1}
        isDisabled={disabled && !disabledTranslation}
      />
    </Flex>
  );
};

export default CustomDeleteButton;
