import { transparentize } from 'polished'

const styles = {
  html: {
    boxSizing: 'border-box',
    fontWeight: 'normal',
  },
  body: {
    fontFamily: 'body',
    color: 'gray.800',
    bg: 'gray.50',
    fontWeight: 'normal',
    fontSize: 'sm',
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
  },
  a: {
    color: 'blue.500',
    _hover: {
      textDecoration: 'underline',
    },
  },
  p: {
    fontSize: 'sm',
    fontWeight: 'normal',
    fontFamily: 'body',
    color: 'gray.800',
    my: 1,
    mx: 2,
    px: 2,
  },
  global: (props) => {
    return {
      '.emoji-mart': {
        position: 'absolute',
        fontFamily: 'body',
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
      '.ql-snow .ql-tooltip a.ql-preview': {
        textDecoration: 'underline',
        color: 'gray.100',
        px: 2,
        mr: 2,
        borderRadius: 5,
        _hover: {
          bg: 'gray.900',
        },
      },
      '.ql-editor.ql-blank::before': {
        fontWeight: 'normal',
        fontSize: 'md',
        fontStyle: 'normal',
        opacity: 0.7,
        left: 2,
      },
      '.ql-editor': {
        fontFamily: 'body',
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
        fontFamily: 'body',
      },
      '.ql-snow .ql-editor a': {
        color: 'gray.800',
      },
      '.ql-snow .ql-tooltip': {
        zIndex: 100,
        left: -6,
        borderRadius: 6,
        color: 'gray.100',
        bg: 'gray.800',
      },
      '.ql-action': {
        borderRadius: 6,
        padding: 1,
        color: 'gray.300',
      },
      '.ql-snow .ql-tooltip.ql-editing a.ql-action::after': {
        px: 2,
        ml: 2,
      },
      '.ql-snow .ql-tooltip.ql-editing input[type=text]': {
        borderColor: 'gray.700',
      },
      '.ql-snow .ql-tooltip a.ql-action::after': {
        borderRadius: 5,
        px: 2,
        py: 1,
        m: 0,
        bg: 'blue.500',
        color: 'gray.100',
        border: 'none',
        fontSize: 'md',
        _hover: {
          bg: 'blue.300',
        },
      },
      '.ql-snow .ql-tooltip a.ql-remove::before': {
        borderRadius: 5,
        px: 2,
        py: 1,
        m: 0,
        bg: 'red.500',
        color: 'gray.100',
        border: 'none',
        fontSize: 'md',
        _hover: {
          bg: 'red.300',
        },
      },
      '.ql-snow .ql-tooltip input[type=text]': {
        borderRadius: 5,
        outlineColor: 'blue.400',
        bg: 'gray.800',
        border: '1px solid',
        borderColor: 'gray.700',
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
        border: 'none',
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
      '.command-modal': {
        width: '605px',
        position: 'absolute',
        top: '80px',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        border: '0px none',
        bg: 'gray.800',
        overflow: 'hidden',
        borderRadius: 5,
        outline: 'none',
        p: 3,
        shadow: 'md',
        mr: '-50%',
        transform: 'translate(-50%, 0px)',
      },
      '.command-overlay': {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: transparentize(0.75, 'gray'),
      },
      '.command-header': {
        color: 'gray.100',
      },
      '.command-content': {
        shadow: 'md',
        position: 'absolute',
        top: '80px',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        mr: '-50%',
        transform: 'translate(-50%, 0)',
        border: '0px none',
        bg: 'gray.800',
        overflow: 'hidden',
        borderRadius: 5,
        outline: 'none',
        p: 6,
        minW: '600px',
      },
      '.command-container': {
        fontFamily: 'body',
        fontWeight: 'light',
        fontSize: 'sm',
      },
      '.command-input': {
        fontSize: 'sm',
        borderRadius: 5,
        width: '100%',
        p: 2,
        outline: 'none',
        bg: 'gray.800',
      },
      '.command-inputOpen': {
        border: 'none !important',
        color: 'gray.200',
        bg: 'gray.700',
      },
      '.command-inputFocused': {
        color: 'gray.200',
        bg: 'gray.700',
      },
      '.command-suggestionsContainer': {
        borderRadius: 5,
        border: 'none',
      },
      '.command-suggestionsContainerOpen': {
        overflow: 'hidden',
        borderColor: 'gray.600',
        borderBottom: '1px solid',
        maxH: '315px',
        mt: 2,
      },
      '.command-suggestionsList': {
        listStyle: 'none',
        p: 0,
        mb: 0,
        mt: 0,
        w: '100%',
        borderRadius: 5,
      },
      '.command-suggestion': {
        borderRadius: 5,
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: 'medium',
        color: 'gray.200',
        borderTop: 0,
        bg: 'gray.800',
        py: 1,
        px: 2,
        _hover: {
          bg: 'gray.900',
        },
        cursor: 'pointer',
        '> div': {
          width: '100%',
        },
        '> div > div': {
          alignItems: 'center',
        },
        '> div > div > span > b': {
          color: 'blue.500',
          fontWeight: 'semibold',
        },
      },
      '.command-suggestionHighlighted': {
        bg: 'gray.900',
      },
      '.command-spinner': {
        borderTop: '0.4em solid rgba(255, 255, 255, 0.2)',
        borderRight: '0.4em solid rgba(255, 255, 255, 0.2)',
        borderBottom: '0.4em solid rgba(255, 255, 255, 0.2)',
        borderLeft: '0.4em solid rgb(255, 255, 255)',
      },
      '.command-shortcut': {
        fontSize: 'xs',
        fontFamily: 'mono',
        color: 'gray.700',
        backgroundColor: 'gray.200',
        border: '1px solid',
        borderColor: 'gray.200',
        borderRadius: 5,
        py: 1,
        px: 2,
      },
      '.Toastify__toast': {
        fontSize: 'md',
      },
      '.Toaastify__toast--error': {
        bg: 'red.500',
      },
      '.Toastify__toast--dark': {
        bg: 'gray.800',
        color: 'gray.50',
      },
    }
  },
}
export default styles
