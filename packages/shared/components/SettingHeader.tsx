import { Text } from "@chakra-ui/react";

type SettingHeaderProps = { name: string };
const SettingHeader = ({ name }: SettingHeaderProps): JSX.Element => (
  <Text pb={2} pt={6} px={0} fontSize="xl" fontWeight="semibold">
    {name}
  </Text>
);

export default SettingHeader;
