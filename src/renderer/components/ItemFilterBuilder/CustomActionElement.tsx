import QueryBuilder, { ActionProps } from 'react-querybuilder';
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
    className={className}
    title={disabledTranslation && disabled ? disabledTranslation.title : title}
    onClick={(e) => handleOnClick(e)}
    size="sm"
    isDisabled={disabled && !disabledTranslation}
  >
    {disabledTranslation && disabled ? disabledTranslation.title : title}
  </Button>
);

export default CustomActionElement;
