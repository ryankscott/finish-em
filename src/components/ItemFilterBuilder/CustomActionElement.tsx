import { ActionProps } from 'react-querybuilder';
import { Button } from '@chakra-ui/react';

const CustomActionElement = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  disabledTranslation,
}: ActionProps) => (
  <Button
    variant="outline"
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={(e) => handleOnClick(e)}
    size="sm"
    isDisabled={disabled && !disabledTranslation}
    bg={'transparent'}
    _active={{
      bg: 'transparent',
    }}
    _hover={{
      bg: 'transparent',
    }}
    _focus={{
      bg: 'transparent',
    }}
  >
    {disabledTranslation && disabled ? disabledTranslation.title : title}
  </Button>
);

export default CustomActionElement;
