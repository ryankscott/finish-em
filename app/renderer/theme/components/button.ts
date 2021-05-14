import { mode } from '@chakra-ui/theme-tools'

type Dict = Record<string, any>
function baseStyle(props: Record<string, any>) {
  return {
    size: 'md',
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
  }
}

function variantDefault(props: Dict) {
  return {
    bg: mode('gray.50', 'gray.800')(props),
    color: mode('gray.700', 'gray.200')(props),
    borderColour: 'transparent',
    _hover: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _active: {
      bg: mode('gray.100', 'gray.900')(props),
    },
    _focus: {
      bg: mode('gray.100', 'gray.900')(props),
    },
  }
}

function variantPrimary(props: Dict) {
  return {
    bg: mode('blue.400', 'blue.500')(props),
    color: 'white',
    _hover: {
      bg: mode('blue.400', 'blue.600')(props),
    },
    _active: {
      bg: mode('blue.400', 'blue.600')(props),
    },
    _focus: {
      bg: mode('blue.400', 'blue.600')(props),
    },
    _disabled: {
      bg: mode('blue.300', 'blue.800')(props),
    },
  }
}

function variantError(props: Dict) {
  return {
    bg: 'red.400',
    color: 'white',
    _hover: {
      bg: 'red.500',
    },
    _focus: {
      bg: 'red.500',
    },
    _active: {
      bg: 'red.500',
    },
  }
}
function variantInvert(props: Dict) {
  return {
    bg: 'gray.800',
    color: 'gray.50',
    _hover: {
      bg: 'gray.900',
    },
    _active: {
      bg: 'gray.900',
    },
    _focus: {
      bg: 'gray.900',
    },
  }
}
function variantSubtle(props: Dict) {
  return {
    bg: 'transparent',
    color: mode('gray.900', 'gray.50'),
    shadow: 'none',
    _hover: {
      bg: 'transparent',
    },
    _active: {
      bg: 'transparent',
    },
    _focus: {
      bg: 'transparent',
    },
  }
}

const sizes = {
  lg: {
    h: 10,
    minW: 10,
    fontSize: 'lg',
    px: 6,
  },
  md: {
    h: 8,
    minW: 8,
    fontSize: 'md',
    px: 3,
  },
  sm: {
    h: 6,
    minW: 6,
    fontSize: 'sm',
    px: 3,
  },
  xs: {
    h: 4,
    minW: 4,
    fontSize: 'xs',
    px: 2,
  },
}

const variants = {
  default: variantDefault,
  error: variantError,
  invert: variantInvert,
  primary: variantPrimary,
  subtle: variantSubtle,
}

export default {
  baseStyle,
  variants,
  sizes,
}
