import { editableAnatomy as parts } from '@chakra-ui/anatomy';
import { mode } from '@chakra-ui/theme-tools';
import type { SystemStyleObject } from '@chakra-ui/theme-tools';

const baseStylePreview = (props: Record<string, any>): SystemStyleObject => ({
  w: '100%',
  borderRadius: 'md',
  py: '3px',
  _hover: {
    bg: mode('gray.100', 'gray.900')(props),
  },
  transitionProperty: 'common',
  transitionDuration: 'normal',
});

const baseStyleInput = (props: Record<string, any>): SystemStyleObject => ({
  borderRadius: 'md',
  py: '3px',
  transitionProperty: 'common',
  transitionDuration: 'normal',
  width: 'full',
  _focus: {
    bg: mode('gray.100', 'gray.900')(props),
    boxShadow: 'outline',
  },
  _placeholder: { opacity: 0.6 },
});

const baseStyleTextarea: SystemStyleObject = {
  borderRadius: 'md',
  py: '3px',
  transitionProperty: 'common',
  transitionDuration: 'normal',
  width: 'full',
  _focus: { boxShadow: 'outline' },
  _placeholder: { opacity: 0.6 },
};

const baseStyle = (props) => {
  return {
    preview: baseStylePreview(props),
    input: baseStyleInput(props),
    textarea: baseStyleTextarea,
  };
};

export default {
  parts: parts.keys,
  baseStyle,
};
