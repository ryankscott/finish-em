import { mode } from '@chakra-ui/theme-tools';

const parts = ['item', 'command', 'list', 'button', 'groupTitle', 'divider'];

function baseStyleList(props: Record<string, any>) {
  return {
    color: mode('gray.800', 'gray.100')(props),
    bg: mode('gray.50', 'gray.800')(props),
    boxShadow: mode('sm', 'dark-lg')(props),
    minW: '3xs',
    py: '2',
    zIndex: 1,
    borderRadius: 'md',
    borderWidth: '1px',
  };
}

function baseStyleItem(props: Record<string, any>) {
  return {
    py: '0.4rem',
    px: '0.8rem',
    fontSize: 'md',
    fontWeight: 400,
    transition: 'background 50ms ease-in 0s',
    bg: mode('gray.50', 'gray.800')(props),
    color: mode('gray.800', 'gray.100')(props),
    _focus: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _hover: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _active: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _expanded: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  };
}

const baseStyleGroupTitle = {
  mx: 4,
  my: 2,
  fontWeight: 'semibold',
  fontSize: 'sm',
};

const baseStyleCommand = {
  opacity: 0.6,
};

const baseStyleDivider = {
  border: 0,
  borderBottom: '1px solid',
  borderColor: 'inherit',
  my: '0.5rem',
  opacity: 0.6,
};

const baseStyleButton = (props: Record<string, any>) => {
  return {
    m: 0.5,
    bg: mode('gray.50', 'gray.800')(props),
    color: mode('gray.800', 'gray.200')(props),
    border: '1px solid',
    borderColor: 'transparent',
    fontWeight: 'medium',
    _hover: {
      bg: mode('gray.100', 'gray.900'),
    },
    _active: {
      bg: mode('gray.100', 'gray.900'),
    },
    _focus: {
      bg: mode('gray.100', 'gray.900'),
    },
  };
};

function invertVariant(props: Record<string, any>) {
  return {
    divider: {
      bg: 'gray.800',
      color: 'gray.100',
    },
    command: {
      bg: 'gray.800',
      color: 'gray.100',
    },
    menu: {
      bg: 'gray.800',
      color: 'gray.100',
      shadow: 'dark-xl',
    },
    button: {
      bg: 'gray.800',
      color: 'gray.100',
      border: '1px solid',
      borderColor: 'gray.600',
      _active: {
        bg: `gray.900`,
        color: 'gray.100',
      },
      _focus: {
        bg: `gray.900`,
        color: 'gray.100',
      },
      _hover: {
        bg: `gray.900`,
        color: 'gray.100',
      },
    },
    list: {
      color: 'gray.100',
    },
    item: {
      color: 'gray.100',
      bg: 'gray.800',
      _focus: {
        bg: `gray.900`,
      },
      _active: {
        bg: `gray.900`,
      },
      _hover: {
        bg: `gray.900`,
      },
      _expanded: {
        bg: `gray.900`,
      },
      _disabled: {
        opacity: 0.4,
        cursor: 'not-allowed',
      },
    },
  };
}

const variants = {
  invert: invertVariant,
};

const baseStyle = (props: Record<string, any>) => ({
  list: baseStyleList(props),
  item: baseStyleItem(props),
  button: baseStyleButton(props),
  groupTitle: baseStyleGroupTitle,
  command: baseStyleCommand,
  divider: baseStyleDivider,
});

export default {
  parts,
  baseStyle,
  variants,
};
