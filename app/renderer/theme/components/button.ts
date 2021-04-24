const Button = {
  baseStyle: {
    size: 'md',
    m: 0.5,
    bg: 'gray.50',
    color: 'gray.800',
    border: '1px solid',
    borderColor: 'transparent',
    fontWeight: 'medium',
    _hover: {
      bg: 'gray.100',
    },
  },
  variants: {
    default: {
      bg: 'gray.50',
      color: 'gray.700',
      borderColour: 'transparent',
      _hover: {
        bg: 'gray.100',
      },
    },
    primary: {
      bg: 'blue.400',
      color: 'white',
      _hover: {
        bg: 'blue.500',
      },
      _disabled: {
        bg: 'blue.300',
      },
    },
    error: {
      bg: 'red.400',
      color: 'white',
      _hover: {
        bg: 'red.500',
      },
    },
    invert: {
      bg: 'gray.800',
      color: 'white',
      _hover: {
        bg: 'gray.900',
      },
    },
    subtle: {
      bg: 'transparent',
      color: 'gray.800',
      shadow: 'none',
      _hover: {
        bg: 'transparent',
      },
    },
    subtleInvert: {},
  },
  sizes: {
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
  },
}
export default Button
