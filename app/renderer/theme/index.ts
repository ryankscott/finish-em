// theme.js
import { extendTheme } from '@chakra-ui/react'
// Global style overrides
import styles from './styles'
// Foundational style overrides
import typography from './foundations/typography'
import colors from './foundations/colors'
import space from './foundations/space'

// Component style overrides
import Button from './components/button'
import Menu from './components/menu'
const theme = extendTheme({
  ...typography,
  space,
  colors,
  styles,
  // Other foundational style overrides go here
  components: {
    Button,
    Menu,
    // Other components go here
  },
})
export default theme
