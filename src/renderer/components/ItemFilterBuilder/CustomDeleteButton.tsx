import { ActionProps } from 'react-querybuilder';
import { Flex, Icon, IconButton } from '@chakra-ui/react';
import { Icons } from 'renderer/assets/icons';

const CustomDeleteButton = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Flex position="absolute" top="0px" right="0px" justifyContent="flex-end">
    <IconButton
      aria-label="delete"
      variant="subtle"
      icon={<Icon as={Icons.close} />}
      onClick={(e) => handleOnClick(e)}
      size="sm"
      ml={1}
      isDisabled={disabled && !disabledTranslation}
    />
  </Flex>
);

export default CustomDeleteButton;
