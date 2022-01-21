import { IconType } from '../interfaces';
import { Icons } from '../assets/icons';
import { Flex, Text, useTheme } from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  name: string;
  iconName: IconType;
  sidebarVisible: boolean;
}

const SidebarSection = (props: Props) => {
  const theme = useTheme();

  return (
    <Flex
      key={uuidv4()}
      direction={'row'}
      color={'gray.100'}
      width="100%"
      alignItems="center"
      justifyContent={props.sidebarVisible ? 'flex-start' : 'center'}
      mx={props.sidebarVisible ? 2 : 0}
      my={0}
      px={props.sidebarVisible ? 2 : 0}
      py={2}
      pt={props.sidebarVisible ? 4 : 2}
    >
      {Icons[props.iconName]('22px', '22px', theme.colors.blue[500])}
      {props.sidebarVisible && (
        <Text key={uuidv4()} fontSize="lg" my={1} mx={2} color={'blue.500'}>
          {props.name}
        </Text>
      )}
    </Flex>
  );
};

export default SidebarSection;
