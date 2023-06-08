import { borderColor, transparentize } from "polished";
import type { Styles, GlobalStyleProps } from "@chakra-ui/theme-tools";

import { mode } from "@chakra-ui/theme-tools";

const styles: Styles = {
  html: {
    boxSizing: "border-box",
    fontWeight: "normal",
    outlineColor: "blue.500",
  },
  // @ts-ignore
  body: (props) => {
    return {
      fontFamily: "body",
      color: mode("gray.800", "gray.100")(props),
      bg: mode("gray.50", "gray.800")(props),
      fontWeight: "normal",
      fontSize: "sm",
      boxSizing: "border-box",
      padding: 0,
      margin: 0,
      outlineColor: "blue.500",
    };
  },
  a: {
    color: "blue.500",
    _hover: {
      textDecoration: "underline",
    },
  },
  // @ts-ignore
  p: (props) => {
    return {
      fontSize: "sm",
      fontWeight: "normal",
      fontFamily: "body",
      color: mode("gray.800", "gray.100")(props),
      my: 1,
      mx: 2,
      px: 2,
    };
  },
  global: (props: GlobalStyleProps) => {
    return {
      "em-emoji-picker": {
        position: "fixed",
        top: "20%",
        zIndex: 101,
        borderRadius: "md",
        shadow: "md",
      },
      ".quill": {
        width: "100%",
        position: "relative",
        bg: mode("gray.50", "gray.800")(props),
        border: "none",
        borderRadius: "md",
      },
      ".ql-snow .ql-tooltip a.ql-preview": {
        textDecoration: "underline",
        color: mode("gray.100", "gray.200")(props),
        px: 2,
        mr: 2,
        borderRadius: "md",
        _hover: {
          bg: "gray.900",
        },
      },
      ".ql-editor.ql-blank::before": {
        fontWeight: "normal",
        fontSize: "md",
        fontStyle: "normal",
        opacity: 0.7,
        left: 2,
        color: mode("gray.800", "gray.200")(props),
      },
      ".ql-editor": {
        fontFamily: "body",
        overflow: "auto",
        height: "auto",
        py: 2,
        px: 2,
        borderRadius: "md",
        border: "none",
        color: mode("gray.800", "gray.200")(props),
        transition: "all 0.1s ease-in-out",
        _hover: {
          bg: mode("gray.100", "gray.900")(props),
        },
        _focus: {
          bg: mode("gray.100", "gray.900")(props),
        },
      },
      ".ql-editor p": {
        color: mode("gray.800", "gray.200")(props),
      },
      ".ql-container": {
        border: "none",
        borderRadius: "md",
        fontFamily: "body",
      },
      ".ql-snow .ql-editor a": {
        color: "gray.800",
      },
      ".ql-snow .ql-tooltip": {
        zIndex: 100,
        left: -6,
        borderRadius: 6,
        color: "gray.100",
        bg: "gray.800",
      },
      ".ql-action": {
        borderRadius: 6,
        padding: 1,
        color: "gray.300",
      },
      ".ql-snow .ql-tooltip.ql-editing a.ql-action::after": {
        px: 2,
        ml: 2,
      },
      ".ql-snow .ql-tooltip.ql-editing input[type=text]": {
        borderColor: "gray.700",
      },
      ".ql-snow .ql-tooltip a.ql-action::after": {
        borderRadius: "md",
        px: 2,
        py: 1,
        m: 0,
        bg: "blue.500",
        color: "gray.100",
        border: "none",
        fontSize: "md",
        _hover: {
          bg: "blue.300",
        },
      },
      ".ql-snow .ql-tooltip a.ql-remove::before": {
        borderRadius: "md",
        px: 2,
        py: 1,
        m: 0,
        bg: "red.500",
        color: "gray.100",
        border: "none",
        fontSize: "md",
        _hover: {
          bg: "red.300",
        },
      },
      ".ql-snow .ql-tooltip input[type=text]": {
        borderRadius: "md",
        outlineColor: "blue.400",
        bg: "gray.800",
        border: "1px solid",
        borderColor: "gray.700",
      },
      ".ql-toolbar": {
        display: "flex",
        padding: 2,
        borderRadius: "md",
        bg: mode("gray.100", "gray.900")(props),
        border: "1px solid",
        borderColor: mode("gray.200", "gray.600")(props),
        position: "absolute",
        bottom: "-1px",
        width: "100%",
        transform: "translateY(100%)",
        transition: "all 0.2s ease-in-out",
      },

      ".ql-toolbar.ql-snow": {
        padding: 1,
        borderColor: mode("gray.200", "gray.600")(props),
      },
      ".ql-toolbar.ql-snow .ql-formats": {
        mr: 3,
      },
      ".ql-toolbar.ql-snow + .ql-container.ql-snow": {
        border: "none",
        _focus: {
          border: "1px solid",
          borderColor: mode("gray.200", "gray.600")(props),
        },
      },
      ".ql-snow .ql-stroke": {
        color: mode("gray.800", "gray.200")(props),
        stroke: mode("gray.800", "gray.200")(props),
      },
      ".ql-stroke": {
        strokeWidth: "0.9 !important",
        color: mode("gray.800", "gray.200")(props),
        stroke: mode("gray.800", "gray.200")(props),
      },
      ".ql-stroke.ql-thin": {
        strokeWidth: "0.8 !important",
      },
      ".ql-snow.ql-toolbar button": {
        borderRadius: 3,
      },

      ".ql-snow.ql-toolbar button:hover .ql-stroke": {
        color: mode("gray.800", "gray.200")(props),
        stroke: mode("gray.800", "gray.200")(props),
      },
      ".ql-snow.ql-toolbar button:hover .ql-fill": {
        fill: mode("gray.800", "gray.200")(props),
      },

      ".ql-snow.ql-toolbar button:hover": {
        color: "gray.800",
        bg: mode("gray.200", "gray.800")(props),
      },
      ".ql-snow .ql-stroke.ql-fill": {
        fill: mode("gray.800", "gray.200")(props),
      },

      ".ql-snow.ql-toolbar button.ql-active": {
        color: "gray.800",
        bg: mode("gray.300", "gray.900")(props),
      },

      ".ql-snow.ql-toolbar button.ql-active .ql-stroke": {
        stroke: mode("gray.900", "gray.400")(props),
        strokeWidth: 1.25,
      },
      ".quill-blurred-editor": {
        ".ql-toolbar": {
          display: "none",
        },
      },
      ".command-modal": {
        width: "605px",
        position: "absolute",
        top: "80px",
        left: "50%",
        right: "auto",
        bottom: "auto",
        border: "0px none",
        bg: "gray.800",
        overflow: "hidden",
        borderRadius: "md",
        outline: "none",
        p: 3,
        shadow: "md",
        mr: "-50%",
        transform: "translate(-50%, 0px)",
      },
      ".command-overlay": {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: transparentize(0.75, "gray"),
      },
      ".command-header": {
        color: "gray.100",
      },
      ".command-content": {
        shadow: "md",
        position: "absolute",
        top: "80px",
        left: "50%",
        right: "auto",
        bottom: "auto",
        mr: "-50%",
        transform: "translate(-50%, 0)",
        border: "0px none",
        bg: "gray.800",
        overflow: "hidden",
        borderRadius: "md",
        outline: "none",
        p: 6,
        minW: "600px",
      },
      ".command-container": {
        fontFamily: "body",
        fontWeight: "light",
        fontSize: "sm",
      },
      ".command-input": {
        fontSize: "sm",
        borderRadius: "md",
        width: "100%",
        p: 2,
        outline: "none",
        bg: "gray.800",
      },
      ".command-inputOpen": {
        border: "none !important",
        color: "gray.200",
        bg: "gray.700",
      },
      ".command-inputFocused": {
        color: "gray.200",
        bg: "gray.700",
      },
      ".command-suggestionsContainer": {
        borderRadius: "md",
        border: "none",
      },
      ".command-suggestionsContainerOpen": {
        overflow: "hidden",
        borderColor: "gray.600",
        borderBottom: "1px solid",
        maxH: "315px",
        mt: 2,
      },
      ".command-suggestionsList": {
        listStyle: "none",
        p: 0,
        mb: 0,
        mt: 0,
        w: "100%",
        borderRadius: "md",
      },
      ".command-suggestion": {
        borderRadius: "md",
        display: "flex",
        justifyContent: "space-between",
        fontWeight: "medium",
        color: "gray.200",
        borderTop: 0,
        bg: "gray.800",
        py: 1,
        px: 2,
        _hover: {
          bg: "gray.900",
        },
        cursor: "pointer",
        "> div": {
          width: "100%",
        },
        "> div > div": {
          alignItems: "center",
        },
        "> div > div > span > b": {
          color: "blue.500",
          fontWeight: "semibold",
        },
      },
      ".command-suggestionHighlighted": {
        bg: "gray.900",
      },
      ".command-spinner": {
        borderTop: "0.4em solid rgba(255, 255, 255, 0.2)",
        borderRight: "0.4em solid rgba(255, 255, 255, 0.2)",
        borderBottom: "0.4em solid rgba(255, 255, 255, 0.2)",
        borderLeft: "0.4em solid rgb(255, 255, 255)",
      },
      ".command-shortcut": {
        fontSize: "xs",
        fontFamily: "mono",
        color: "gray.700",
        backgroundColor: "gray.200",
        border: "1px solid",
        borderColor: "gray.200",
        borderRadius: "md",
        py: 1,
        px: 2,
      },
      ".Toastify__toast": {
        fontSize: "md",
      },
      ".Toaastify__toast--error": {
        bg: "red.500",
      },
      ".Toastify__toast--dark": {
        bg: "gray.800",
        color: "gray.50",
      },
      ".rule": {
        p: 1,
        pr: 6,
        m: 1,
        mt: 0,
        border: "1px solid",
        borderColor: mode("gray.200", "gray.700")(props),
        borderRadius: "md",
        position: "relative",
      },
      ".ruleGroup": {
        p: 1,
        pt: 0,
        m: 1,
        mt: 0,
        border: "1px solid",
        borderColor: mode("gray.200", "gray.700")(props),
        borderRadius: "md",
        position: "relative",
      },
      '.ruleGroup[data-level="1"]': {
        bg: mode("gray.50", "gray.700")(props),
        borderColor: mode("gray.50", "gray.700")(props),
      },
      '.ruleGroup[data-level="2"]': {
        bg: mode("blue.50", "blue.200")(props),
        borderColor: mode("blue.50", "blue.200")(props),
      },
      '.ruleGroup[data-level="3"]': {
        bg: mode("purple.50", "purple.200")(props),
        borderColor: mode("purple.50", "purple.200")(props),
      },
      '.ruleGroup[data-level="4"]': {
        bg: mode("green.50", "green.200")(props),
        borderColor: mode("green.50", "green.200")(props),
      },
      '.ruleGroup[data-level="5"]': {
        bg: mode("yellow.50", "yellow.200")(props),
        borderColor: mode("yellow.50", "yellow.200")(props),
      },
      '.ruleGroup[data-level="6"]': {
        bg: mode("red.50", "red.200")(props),
        borderColor: mode("red.50", "red.200")(props),
      },
      ".react-datepicker-wrapper > div > input[type=text]": {
        paddingInline: 2,
        p: 2,
        fontSize: "sm",
        border: "1px solid",
        bg: mode("gray.50", "gray.800")(props),
        borderRadius: "md",
        maxH: "32px",
        outlineOffset: "2px",
        borderColor: "blue.400",
        boxShadow: "0 0 0 1px #14a7eb",
        outline: "2px solid transparent",
      },
      ".react-datepicker-wrapper > div > input[type=text]:active": {
        border: "1px solid",
        outline: "none",
      },
      // Tiptap
      ".ProseMirror": {
        py: 1,
        px: 2,
        mt: 0,
        borderRadius: "md",
        fontSize: "lg",
        "> * + *": {
          marginTop: "0.75em",
        },
        // @see https://github.com/jesster2k10/guava-cards/blob/5d5c283eb720bf503258f4e17bce3865d35fd8d3/packages/website/src/bundles/editor/ContentEditor.tsx#L86
        "p.is-editor-empty:first-of-type::before": {
          content: "attr(data-placeholder)",
          color: "gray.500",
          float: "left",
          pointerEvents: "none",
          height: 0,
        },
        "&:focus": {
          outline: "none",
          backgroundColor: mode("gray.100", "gray.900")(props),
        },
        "&:hover": {
          backgroundColor: mode("gray.100", "gray.900")(props),
        },
        a: {
          textDecoration: "underline",
        },
        "a:hover": {
          cursor: "pointer",
        },
        h1: {
          fontSize: "1.25rem",
        },
        h2: {
          fontSize: "1.15rem",
        },
        h3: {
          fontSize: "1rem",
        },
        "h1, h2, h3, h4,  h5, h6 ": {
          lineHeight: "1.1",
          fontWeight: "700",
        },
        "ul, ol": {
          padding: "0 1.2rem",
        },
        code: {
          bg: "rgba(#616161, 0.1)",
          color: "#616161",
        },
        pre: {
          fontFamily: "JetBrainsMono, 'Courier New', Courier, monospace",
          background: mode("gray.900", "blue.200")(props),
          color: mode("white", "gray.900")(props),
          padding: "0.75rem 1rem",
          rounded: "lg",
          whiteSpace: "pre-wrap",
          code: {
            color: "inherit",
            p: 0,
            background: "none",
            fontSize: "0.8rem",
          },

          ".hljs-comment, .hljs-quote": {
            color: "#616161",
          },

          ".hljs-variable, .hljs-template-variable,  .hljs-attribute, .hljs-tag, .hljs-name, .hljs-regexp, .hljs-link, .hljs-name, .hljs-selector-id, .hljs-selector-class":
            {
              color: "#F98181",
            },

          ".hljs-number,  .hljs-meta, .hljs-built_in, .hljs-builtin-name, .hljs-literal,  .hljs-type, .hljs-params":
            {
              color: "#FBBC88",
            },

          ".hljs-string, .hljs-symbol, .hljs-bullet": {
            color: "#B9F18D",
          },

          ".hljs-title, .hljs-section": {
            color: "#FAF594",
          },

          ".hljs-keyword, .hljs-selector-tag": {
            color: "#70CFF8",
          },

          ".hljs-emphasis": {
            fontStyle: "italic",
          },

          ".hljs-strong": {
            fontWeight: 700,
          },
        },
        blockquote: {
          pl: 4,
          borderLeft: "2px solid rgba(13, 13, 13, 0.1)",
          borderLeftColor: mode(undefined, "whiteAlpha.500")(props),
        },
        "span[data-spoiler]": {
          bg: mode("gray.900", "gray.100")(props),
          _hover: {
            bg: "transparent",
          },
          // @apply dark:bg-gray-100 bg-gray-900 dark:hover:bg-transparent hover:bg-transparent;
        },
        img: {
          maxW: "full",
          h: "auto",
        },
        mark: {
          bg: "#FAF594",
        },
        hr: {
          border: "none",
          borderTop: "2px solid rgba(13,13,13,.1)",
          margin: "2rem 0",
        },
      }, // .ProseMirror
      ".bubble-menu": {
        zIndex: 999,
        px: 2,
        py: 1,
        bg: mode("gray.100", "gray.900")(props),
        border: "1px solid",
        borderColor: "chakra-border-color",
        borderRadius: "md",
      },
    };
  },
};
export default styles;
