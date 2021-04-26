const parts = ['preview', 'input']

const baseStylePreview = {
  py: 1,
  px: 2,
  w: '100%',
  transition: 'all 0.2s',
  _hover: {
    bg: 'gray.100',
  },
}

const baseStyleInput = {
  w: '100%',
  borderRadius: 5,
  py: 1,
  px: 2,
  transition: 'all 0.2s',
  width: '100%',
  _focus: { bg: 'gray.100', boxShadow: 'outline' },
  _placeholder: { opacity: 0.6 },
  _active: {
    bg: 'gray.100',
  },
}

const baseStyle = {
  preview: baseStylePreview,
  input: baseStyleInput,
}

export default {
  parts,
  baseStyle,
}
