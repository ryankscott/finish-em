import { mode } from '@chakra-ui/theme-tools'
import { tabsAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

// define a custom variant
const customVariant = definePartsStyle((props) => {

  return {
    tab: {
      border: '2px solid',
      borderColor: 'transparent',
      color: mode(`gray.800`, `gray.100`)(props),
      bg: mode(`gray.50`, `gray.800`)(props),
      borderTopRadius: 'lg',
      borderBottom: 'none',
      _selected: {
        bg: mode(`gray.200`, `gray.900`)(props),
      },
    },
    tablist: {
      minW: "200px",
      shadow: "lg",
      border: "none",
      borderRight: '1px solid',
      borderColor: mode('gray.200', 'gray.900')(props)
    },
    tabpanel: {
      px: 10
    },
  }
})

const variants = {
  custom: customVariant,
}

// export the component theme
const Tabs = defineMultiStyleConfig({ variants })
export default Tabs
