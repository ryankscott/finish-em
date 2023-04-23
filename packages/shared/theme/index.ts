// theme.js
import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import styles from "./styles";

// Foundational style overrides
import typography from "./foundations/typography";
import colors from "./foundations/colors";
import space from "./foundations/space";

// Component style overrides
import Button from "./components/button";
import Menu from "./components/menu";
import Tooltip from "./components/tooltip";
import Editable from "./components/editable";
import CloseButton from "./components/closebutton";
import Tabs from "./components/tabs";

const theme = extendTheme({
  initialColorMode: "light",
  useSystemColorMode: true,
  ...typography,
  space,
  colors,
  styles,
  // Other foundational style overrides go here
  components: {
    Button,
    Menu,
    Tooltip,
    Editable,
    CloseButton,
    Tabs,
  },
});

export default theme;
