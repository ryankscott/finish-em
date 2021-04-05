import { autoUpdater } from 'electron'

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
  global: (props) => {
    return {
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
      '.quill': {
        width: '100%',
        position: 'relative',
      },
      '.ql-preview': {
        textDecoration: 'underline',
        color: 'gray.200',
      },
      '.ql-editor.ql-blank::before': {
        fontWeight: 'normal',
        fontSize: 'md',
        fontStyle: 'normal',
        opacity: 0.7,
        left: 2,
      },
      '.ql-editor': {
        overflow: 'auto',
        height: 'auto',
        py: 2,
        px: 2,
        borderRadius: 4,
        border: 'none',
        _hover: {
          bg: 'gray.100',
        },
        _focus: {
          bg: 'gray.100',
        },
      },
      '.ql-container': {
        border: 'none',
        borderRadius: 4,
      },
      '.ql-snow .ql-editor a': {
        color: 'gray.800',
      },
      '.ql-tooltip': {
        zIndex: 100,
        left: -6,
        borderRadius: 6,
        color: 'gray.300',
        bg: 'gray.800',
      },
      '.ql-action': {
        borderRadius: 6,
        padding: 4,
        color: 'gray.300',
      },
      '.ql-toolbar': {
        display: 'flex',
        padding: 2,
        borderRadius: 4,
        bg: 'gray.100',
        border: '1px solid',
        borderColor: 'gray.100',
        position: 'absolute',
        bottom: 0,
        width: '100%',
        transform: 'translateY(100%)',
        transition: 'all 0.2s ease-in-out',
      },
      '.ql-toolbar.ql-snow': {
        padding: 1,
      },
      '.ql-toolbar.ql-snow .ql-formats': {
        mr: 3,
      },
      '.ql-toolbar.ql-snow + .ql-container.ql-snow': {
        border: '1px solid',
        borderColor: 'gray.100',
        _focus: {
          border: '1px solid',
          borderColor: 'gray.200',
        },
      },
      '.ql-stroke': {
        strokeWidth: '0.9 !important',
      },
      '.ql-stroke.ql-thin': {
        strokeWidth: '0.8 !important',
      },
      '.ql-snow.ql-toolbar button': {
        borderRadius: 3,
      },
      '.ql-snow.ql-toolbar button:hover .ql-stroke': {
        color: 'gray.800',
        stroke: 'gray.800',
      },
      '.ql-snow.ql-toolbar button:hover .ql-fill': {
        fill: 'gray.800',
      },

      '.ql-snow.ql-toolbar button:hover': {
        color: 'gray.800',
        bg: 'gray.200',
      },

      '.ql-snow.ql-toolbar button.ql-active': {
        color: 'gray.800',
        bg: 'gray.300',
      },

      '.ql-snow.ql-toolbar button.ql-active .ql-stroke': {
        stroke: 'gray.900',
        strokeWidth: 1.25,
      },
      '.quill-blurred-editor': {
        '.ql-toolbar': {
          display: 'none',
        },
      },
    }
  },
}
export default styles
