import { Flex, Icon, Text } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { IconType } from "../interfaces";
import { Icons } from "../assets/icons";

interface Props {
  name: string;
  iconName: IconType;
  sidebarVisible: boolean;
}

const SidebarSection = ({ name, iconName, sidebarVisible }: Props) => {
  return (
    <Flex
      key={uuidv4()}
      direction="row"
      color="gray.100"
      width="100%"
      alignItems="center"
      justifyContent={sidebarVisible ? "flex-start" : "center"}
      mx={sidebarVisible ? 1 : 0}
      my={0}
      px={sidebarVisible ? 1 : 0}
      py={2}
      pt={sidebarVisible ? 4 : 2}
    >
      <Icon as={Icons[iconName]} color="blue.700" />
      {sidebarVisible && (
        <Text key={uuidv4()} fontSize="lg" my={1} mx={2} color="blue.700">
          {name}
        </Text>
      )}
    </Flex>
  );
};

export default SidebarSection;
