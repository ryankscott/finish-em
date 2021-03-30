const styles = {
  // styles for the `a`
  a: {
    color: 'teal.500',
    _hover: {
      textDecoration: 'underline',
    },
  },
  html: {
    boxSizing: 'border-box',
  },
  body: {
    fontFamily: 'fonts.body',
    color: 'gray.800',
    bg: 'gray.50',
    fontWeight: 'fontWeights.normal',
    fontSize: 'fontSizes.sm',
    boxSizing: 'border-box',
    padding: 'spacing.0',
    margin: 'spacing.0',
  },
  global: {
    '.emoji-mart': {
      position: 'absolute',
      fontFamily: 'fonts.body',
      bg: 'gray.50',
      borderColour: 'gray.100',
      borderRadius: 4,
      shadow: 'xl',
      zIndex: 99,
    },
    '.emoji-mart-search input': {
      fontSize: 'xs',
    },
    '.emoji-mart-category-label': {
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'normal',
      bg: 'gray.100',
    },
    '.emoji-mart-category-label span': {
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'normal',
      bg: 'gray.50',
    },
    '.emoji-mart-emoji': {
      zIndex: 99,
    },
  },
}
export default styles
