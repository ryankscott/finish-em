import { lighten, darken, readableColor, transparentize } from 'polished'
import * as CSS from 'csstype'
import { ThemeType, fontSizeType } from './interfaces'
import { StylesConfig } from 'react-select'
import { createGlobalStyle } from './StyledComponents'

export const GlobalStyle = createGlobalStyle`
/* Autocomplete bar  */
.CodeMirror-hints {
  position: absolute;
  z-index: 10;
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0px;
  box-shadow: 2px 3px 5px rgba(0,0,0,.2);
  border-radius: 4px;
  border: 1px solid ${(props) => props.theme.colours.borderColour};
  background-color: ${(props) => props.theme.colours.backgroundColour};
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  max-height: 20em;
  overflow-y: auto;
}
.CodeMirror-hint {
  margin: 0;
  padding: 0px;
  border-radius: 2px;
  white-space: pre;
  cursor: pointer;
  color: ${(props) => props.theme.colours.textColour};
  background: ${(props) => props.theme.colours.backgroundColour};
}
li.CodeMirror-hint-active {
  color: ${(props) => props.theme.colours.textColour};
  background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  > div {
  background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  }
}
/* BASICS */
.CodeMirror {
  /* Set height, width, borders, and global font properties here */
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  height: 300px;
  color: ${(props) => props.theme.colours.textColour};
  direction: ltr;
}
/* PADDING */
.CodeMirror-lines {
  background: ${(props) => props.theme.colours.backgroundColour};
  padding: 4px 0; /* Vertical padding aro&und content */
}
.CodeMirror-lines:hover {
  background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
}
.CodeMirror-lines:focus{
  background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  padding: 0 4px; /* Horizontal padding of content */
}
.CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  background-color: white; /* The little square between H and V scrollbars */
}
/* GUTTER */
.CodeMirror-gutters {
  border-right: 1px solid ${(props) => props.theme.colours.borderColour};
  background: ${(props) => darken(0.05, props.theme.colours.backgroundColour)};
  white-space: nowrap;
}
.CodeMirror-linenumbers {}
.CodeMirror-linenumber {
  padding: 0 3px 0 5px;
  min-width: 20px;
  text-align: right;
  color: #999;
  white-space: nowrap;
}
.CodeMirror-guttermarker { color: black; }
.CodeMirror-guttermarker-subtle { color: #999; }
/* CURSOR */
.CodeMirror-cursor {
  border-left: 1px solid black;
  border-right: none;
  width: 0;
}
/* Shown when moving in bi-directional text */
.CodeMirror div.CodeMirror-secondarycursor {
  border-left: 1px solid silver;
}
.cm-fat-cursor .CodeMirror-cursor {
  width: auto;
  border: 0 !important;
  background: #7e7;
}
.cm-fat-cursor div.CodeMirror-cursors {
  z-index: 1;
}
.cm-fat-cursor-mark {
  background-color: rgba(20, 255, 20, 0.5);
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
}
.cm-animate-fat-cursor {
  width: auto;
  border: 0;
  -webkit-animation: blink 1.06s steps(1) infinite;
  -moz-animation: blink 1.06s steps(1) infinite;
  animation: blink 1.06s steps(1) infinite;
  background-color: #7e7;
}
@-moz-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@-webkit-keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
@keyframes blink {
  0% {}
  50% { background-color: transparent; }
  100% {}
}
/* Can style cursor different in overwrite (non-insert) mode */
.CodeMirror-overwrite .CodeMirror-cursor {}
.cm-tab { display: inline-block; text-decoration: inherit; }
.CodeMirror-rulers {
  position: absolute;
  left: 0; right: 0; top: -50px; bottom: 0;
  overflow: hidden;
}
.CodeMirror-ruler {
  border-left: 1px solid #ccc;
  top: 0; bottom: 0;
  position: absolute;
}
/* DEFAULT THEME */
.cm-s-default .cm-header {color: blue;}
.cm-s-default .cm-quote {color: #090;}
.cm-negative {color: #d44;}
.cm-positive {color: #292;}
.cm-header, .cm-strong {font-weight: bold;}
.cm-em {font-style: italic;}
.cm-link {text-decoration: underline;}
.cm-strikethrough {text-decoration: line-through;}
.cm-s-default .cm-keyword {color: #708;}
.cm-s-default .cm-command {color: #219;}
.cm-s-default .cm-number {color: #164;}
.cm-s-default .cm-def {color: #00f;}
.cm-s-default .cm-variable,
.cm-s-default .cm-punctuation,
.cm-s-default .cm-property,
.cm-s-default .cm-operator {}
.cm-s-default .cm-variable-2 {color: #05a;}
.cm-s-default .cm-variable-3, .cm-s-default .cm-type {color: #085;}
.cm-s-default .cm-comment {color: #a50;}
.cm-s-default .cm-string {color: #a11;}
.cm-s-default .cm-string-2 {color: #f50;}
.cm-s-default .cm-meta {color: #555;}
.cm-s-default .cm-qualifier {color: #555;}
.cm-s-default .cm-builtin {color: #30a;}
.cm-s-default .cm-bracket {color: #997;}
.cm-s-default .cm-tag {color: #170;}
.cm-s-default .cm-attribute {color: #00c;}
.cm-s-default .cm-hr {color: #999;}
.cm-s-default .cm-link {color: #00c;}
.cm-s-default .cm-error {color: #f00;}
.cm-invalidchar {color: #f00;}
.CodeMirror-composing { border-bottom: 2px solid; }
/* Default styles for common addons */
div.CodeMirror span.CodeMirror-matchingbracket {color: #0b0;}
div.CodeMirror span.CodeMirror-nonmatchingbracket {color: #a22;}
.CodeMirror-matchingtag { background: rgba(255, 150, 0, .3); }
.CodeMirror-activeline-background {background: #e8f2ff;}
/* STOP */
/* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */
.CodeMirror {
  position: relative;
  overflow: hidden;
  background: white;
}
.CodeMirror-scroll {
  overflow: scroll !important; /* Things will break if this is overridden */
  /* 50px is the magic margin used to hide the element's real scrollbars */
  /* See overflow: hidden in .CodeMirror */
  margin-bottom: -50px; margin-right: -50px;
  padding-bottom: 50px;
  height: 100%;
  outline: none; /* Prevent dragging from highlighting the element */
  position: relative;
}
.CodeMirror-sizer {
  position: relative;
  border-right: 50px solid transparent;
}
/* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
.CodeMirror-vscrollbar, .CodeMirror-hscrollbar, .CodeMirror-scrollbar-filler, .CodeMirror-gutter-filler {
  position: absolute;
  z-index: 6;
  display: none;
  outline: none;
}
.CodeMirror-vscrollbar {
  right: 0; top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
}
.CodeMirror-hscrollbar {
  bottom: 0; left: 0;
  overflow-y: hidden;
  overflow-x: scroll;
}
.CodeMirror-scrollbar-filler {
  right: 0; bottom: 0;
}
.CodeMirror-gutter-filler {
  left: 0; bottom: 0;
}
.CodeMirror-gutters {
  position: absolute; left: 0; top: 0;
  min-height: 100%;
  z-index: 3;
}
.CodeMirror-gutter {
  white-space: normal;
  height: 100%;
  display: inline-block;
  vertical-align: top;
  margin-bottom: -50px;
}
.CodeMirror-gutter-wrapper {
  position: absolute;
  z-index: 4;
  background: none !important;
  border: none !important;
}
.CodeMirror-gutter-background {
  position: absolute;
  top: 0; bottom: 0;
  z-index: 4;
}
.CodeMirror-gutter-elt {
  position: absolute;
  cursor: default;
  z-index: 4;
}
.CodeMirror-gutter-wrapper ::selection { background-color: transparent }
.CodeMirror-gutter-wrapper ::-moz-selection { background-color: transparent }
.CodeMirror-lines {
  cursor: text;
  min-height: 1px; /* prevents collapsing before first draw */
}
.CodeMirror pre.CodeMirror-line,
.CodeMirror pre.CodeMirror-line-like {
  /* Reset some styles that the rest of the page might have set */
  -moz-border-radius: 0; -webkit-border-radius: 0; border-radius: 0;
  border-width: 0;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
  margin: 0;
  white-space: pre;
  word-wrap: normal;
  line-height: inherit;
  color: inherit;
  z-index: 2;
  position: relative;
  overflow: visible;
  -webkit-tap-highlight-color: transparent;
  -webkit-font-variant-ligatures: contextual;
  font-variant-ligatures: contextual;
}
.CodeMirror-wrap pre.CodeMirror-line,
.CodeMirror-wrap pre.CodeMirror-line-like {
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: normal;
}
.CodeMirror-linebackground {
  position: absolute;
  left: 0; right: 0; top: 0; bottom: 0;
  z-index: 0;
}
.CodeMirror-linewidget {
  position: relative;
  z-index: 2;
  padding: 0.1px; /* Force widget margins to stay inside of the container */
}
.CodeMirror-widget {}
.CodeMirror-rtl pre { direction: rtl; }
.CodeMirror-code {
  outline: none;
}
/* Force content-box sizing for the elements where we expect it */
.CodeMirror-scroll,
.CodeMirror-sizer,
.CodeMirror-gutter,
.CodeMirror-gutters,
.CodeMirror-linenumber {
  -moz-box-sizing: content-box;
  box-sizing: content-box;
}
.CodeMirror-measure {
  position: absolute;
  width: 100%;
  height: 0;
  overflow: hidden;
  visibility: hidden;
}
.CodeMirror-cursor {
  position: absolute;
  pointer-events: none;
}
.CodeMirror-measure pre { position: static; }
div.CodeMirror-cursors {
  visibility: hidden;
  position: relative;
  z-index: 3;
}
div.CodeMirror-dragcursors {
  visibility: visible;
}
.CodeMirror-focused div.CodeMirror-cursors {
  visibility: visible;
}
.CodeMirror-selected { background: #d9d9d9; }
.CodeMirror-focused .CodeMirror-selected { background: #d7d4f0; }
.CodeMirror-crosshair { cursor: crosshair; }
.CodeMirror-line::selection, .CodeMirror-line > span::selection, .CodeMirror-line > span > span::selection { background: #d7d4f0; }
.CodeMirror-line::-moz-selection, .CodeMirror-line > span::-moz-selection, .CodeMirror-line > span > span::-moz-selection { background: #d7d4f0; }
.cm-searching {
  background-color: #ffa;
  background-color: rgba(255, 255, 0, .4);
}
/* Used to force a border model for a node */
.cm-force-border { padding-right: .1px; }
@media print {
  /* Hide the cursor when printing */
  .CodeMirror div.CodeMirror-cursors {
    visibility: hidden;
  }
}
/* See issue #2901 */
.cm-tab-wrap-hack:after { content: ''; }
/* Help users use markselection to safely style text background */
span.CodeMirror-selectedtext { background: none; }
.cm-category {
color: ${(props) => props.theme.colours.primaryColour}
}
.cm-operator {
color: ${(props) => props.theme.colours.textColour}
}
.cm-value {
color: ${(props) => props.theme.colours.penternaryColour}
}
`

export const themes: { [key: string]: ThemeType } = {
  light: {
    name: 'Light',
    font: {
      sansSerif: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;
    },
    fontSizes: {
      xxxsmall: '10px',
      xxsmall: '11px',
      xsmall: '12px',
      small: '13px',
      regular: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '26px',
      xxxlarge: '34px',
    },
    fontWeights: {
      thin: 100,
      regular: 300,
      bold: 500,
      xbold: 700,
    },
    button: {
      default: {
        backgroundColour: '#F9F9F9',
        colour: '#333333',
        borderColour: 'transparent',
        hoverBackgroundColour: darken(0.05, '#F9F9F9'),
      },
      invert: {
        backgroundColour: '#404040',
        colour: '#F9F9F9',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.1, '#404040'),
      },
      primary: {
        backgroundColour: '#2FB1ED',
        colour: '#EEEEEE',
        borderColour: '#2FB1ED',
        hoverBackgroundColour: darken(0.05, '#2FB1ED'),
      },
      error: {
        backgroundColour: '#FF0080',
        colour: '#EEEEEE',
        borderColour: '#FF0080',
        hoverBackgroundColour: darken(0.05, '#FF0080'),
      },
      subtle: {
        backgroundColour: 'rgba(255,255,255, 0)',
        colour: '#333333',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(255,255,255, 0.01)',
      },
      subtleInvert: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.05)',
      },
      disabled: {
        backgroundColour: '#e0e0e0',
        colour: darken(0.4, '#e0e0e0'),
        borderColour: 'transparent',
        hoverBackgroundColour: '#e0e0e0',
      },
    },
    colours: {
      textColour: '#333333',
      altTextColour: '#EEEEEE',
      disabledTextColour: lighten(0.35, '#333333'),
      primaryColour: '#2FB1ED',
      secondaryColour: '#43EFB3',
      tertiaryColour: '#FF0080',
      quarternaryColour: '#EFB343',
      penternaryColour: '#CF43EF',
      backgroundColour: '#F9F9F9',
      borderColour: '#e0e0e0',
      altBorderColour: '#404040',
      altBackgroundColour: '#404040',
      dialogBackgroundColour: '#F5F5F5',
      focusDialogBackgroundColour: darken(0.05, '#F5F5F5'),
      altDialogBackgroundColour: '#404040',
      focusAltDialogBackgroundColour: lighten(0.05, '#404040'),
      focusBackgroundColour: darken(0.08, '#FEFEFE'), // TODO: How to get it to refer to backgroundColour
      focusBorderColour: lighten(0.08, '#e0e0e0'), // TODO: How to get it to refer to backgroundColour
      okColour: '#43EFB3',
      neutralColour: '#2FB1ED',
      errorColour: '#FF0080',
      errorBackgroundColour: lighten(0.3, '#FF0080'),
      staleBackgroundColour: lighten(0.3, '#CF43EF'),
      warningColour: '#EFB343',
      iconColour: '#333333',
      altIconColour: '#F9F9F9',
      headerBackgroundColour: '#404040',
      headerTextColour: '#F9F9F9',
    },
  },
  dark: {
    name: 'Dark',
    font: {
      sansSerif: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;
    },
    fontSizes: {
      xxxsmall: '10px',
      xxsmall: '11px',
      xsmall: '12px',
      small: '13px',
      regular: '14px',
      large: '16px',
      xlarge: '20px',
      xxlarge: '26px',
      xxxlarge: '34px',
    },
    fontWeights: {
      thin: 100,
      regular: 300,
      bold: 500,
      xbold: 700,
    },
    button: {
      default: {
        backgroundColour: '#404040',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.05, '#404040'),
      },
      invert: {
        backgroundColour: '#404040',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.05, '#404040'),
      },

      primary: {
        backgroundColour: '#2FB1ED',
        colour: '#EEEEEE',
        borderColour: '#2FB1ED',
        hoverBackgroundColour: darken(0.05, '#2FB1ED'),
      },
      error: {
        backgroundColour: '#FF0080',
        colour: '#EEEEEE',
        borderColour: '#FF0080',
        hoverBackgroundColour: darken(0.05, '#FF0080'),
      },
      subtle: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
      },
      subtleInvert: {
        backgroundColour: 'rgba(0,0,0,0)',
        colour: '#EEEEEE',
        borderColour: 'transparent',
        hoverBackgroundColour: 'rgba(0,0,0, 0.1)',
      },
      disabled: {
        backgroundColour: lighten(0.1, '#404040'),
        colour: lighten(0.4, '#404040'),
        borderColour: 'transparent',
        hoverBackgroundColour: lighten(0.1, '#404040'),
      },
    },
    colours: {
      textColour: '#EEEEEE',
      altTextColour: '#EEEEEE',
      disabledTextColour: darken(0.25, '#EEEEEE'),
      primaryColour: '#2FB1ED',
      secondaryColour: '#43EFB3',
      tertiaryColour: '#FF0080',
      quarternaryColour: '#EFB343',
      penternaryColour: '#CF43EF',
      backgroundColour: '#404040',
      borderColour: '#909090',
      altBorderColour: '#EEEEEE',
      altBackgroundColour: '#404040',
      dialogBackgroundColour: '#404040',
      focusDialogBackgroundColour: darken(0.05, '#404040'),
      altDialogBackgroundColour: '#404040',
      focusAltDialogBackgroundColour: darken(0.05, '#404040'),
      focusBackgroundColour: darken(0.05, '#404040'), // TODO: How to get it to refer to backgroundColour
      focusBorderColour: darken(0.05, '#909090'), // TODO: How to get it to refer to backgroundColour
      okColour: '#43EFB3',
      neutralColour: '#2FB1ED',
      errorColour: '#FF0080',
      errorBackgroundColour: '#404040',
      staleBackgroundColour: darken(0.3, '#CF43EF'),
      warningColour: '#EFB343',
      iconColour: '#333333',
      altIconColour: '#CCCCCC',
      headerBackgroundColour: darken(0.05, '#404040'),
      headerTextColour: '#F9F9F9',
    },
  },
}

interface SelectStylesProps {
  fontSize: CSS.Property.FontSize 
  textColour: CSS.Property.Color
  altTextColour: CSS.Property.Color
  altBackgroundColour: CSS.Property.BackgroundColor
  backgroundColour: CSS.Property.BackgroundColor
  hideDropdownIndicator?: boolean
  invert?: boolean
  fullWidth?: boolean
}

const generateOptionBackgroundColour = (
  data: { color: string },
  isFocused: boolean,
  altBackgroundColour: CSS.Property.BackgroundColor,
  backgroundColour: CSS.Property.BackgroundColor,
  invert: boolean,
): string => {
  if (data?.color) {
    return data.color 
  }
  if (isFocused) {
    return invert
      ? darken(0.05, altBackgroundColour)
      : darken(0.05, backgroundColour)
  }
  return invert ? altBackgroundColour : backgroundColour
}

export const selectStyles = (props: SelectStylesProps): StylesConfig => {
  return {
    container: (styles) => ({
      ...styles,
      width: props.fullWidth ? '100%' : 'auto',
      padding: '0px 0px',
      border: props.invert ? `1px solid ${lighten(0.2, props.altBackgroundColour)}` : 'none !important',
        borderRadius: '5px',
      '&:active': {
      border: props.invert ? `1px solid ${lighten(0.2, props.altBackgroundColour)}` : 'none !important',
      },
      '&:focus': {
      border: props.invert ? `1px solid ${lighten(0.2, props.altBackgroundColour)}` : 'none !important',
      },
    }),
    input: (styles, {data, isFocused}) => ({
      ...styles,
      display: 'flex',
      alignItems: 'center',
      height:  'auto',
      lineHeight:  'auto',
      padding: '0px 2px',
      color: props.backgroundColour
        ? readableColor(
            props.backgroundColour,
            props.textColour,
            props.altTextColour,
            true,
          )
        : props.invert
        ? props.altTextColour
        : props.textColour,
      fontSize: props.fontSize,
      border: `none !important`,
    }),
    valueContainer: (styles, {data, isFocused}) => ({
      ...styles,
      padding: '0px',
      alignContent: 'center',
      height: 'auto',
      minHeight: '28px',
        fontWeight: 400,
      color: props.backgroundColour
        ? readableColor(
            props.backgroundColour,
            props.textColour,
            props.altTextColour,
            true,
          )
        : props.invert
        ? props.altTextColour
        : props.textColour,
    }),
    menu: (styles) => {
      return {
        ...styles,
        margin: '0px 0px',
        padding: '5px 0px',
        backgroundColor: props.invert
          ? props.altBackgroundColour
          : props.backgroundColour,
        border: 'none',
        borderRadius: '5px',
        tabIndex: 0,
        zIndex: 999,
      }
    },
    option: (styles, { data, isFocused }) => {
      return {
        ...styles,
        tabIndex: 0,
        position: 'relative',
        color: props.invert ? props.altTextColour : props.textColour,
        backgroundColor: generateOptionBackgroundColour(data, isFocused, props.altBackgroundColour, props.backgroundColour, props.invert),
        padding: '5px 10px',
        margin: '0px',
        fontSize: props.fontSize,
        fontWeight: 400,
        zIndex: 999,
        '&:active': {
          fontWeight: 500,
          backgroundColor: darken(0.05,generateOptionBackgroundColour(data, isFocused, props.altBackgroundColour, props.backgroundColour, props.invert)),
      },
        '&:hover': {
          fontWeight: 500,
      }
    }
    },
    placeholder: () => ({ 
      backgroundColor: 'transparent', 
      color: props.invert ? props.altTextColour : props.textColour,
      fontSize: props.fontSize,
      fontWeight: 400,
    }),
    singleValue: (styles) => ({
      ...styles,
      color: props.backgroundColour
        ? readableColor(
            props.backgroundColour,
            props.textColour,
            props.altTextColour,
            true,
          )
        : props.invert
        ? props.altTextColour
        : props.textColour,
    }),
    control: (styles) => ({
      ...styles,
      display: 'flex',
      minHeight: 'none',
      flexDirection: 'row',
      alignContent: 'center',
      margin: 0,
      padding: '0px 12px',
      height: '30px',
      width:  'auto',
      fontSize: props.fontSize,
      backgroundColor: generateOptionBackgroundColour(null, false, props.altBackgroundColour, props.backgroundColour, props.invert),
      color: props.invert ? props.altTextColour : props.textColour,
      border: 'none',
      boxShadow: 'none !important',
      borderRadius: '5px',
      '&:hover': {
        backgroundColor: darken(0.05, generateOptionBackgroundColour(null, false, props.altBackgroundColour, props.backgroundColour, props.invert)),
      },
      '&:active': {
        backgroundColor: darken(0.05, generateOptionBackgroundColour(null, false, props.altBackgroundColour, props.backgroundColour, props.invert)),
        boxShadow: 'none !important',
      },
      '&:focus': {
        backgroundColor: darken(0.05, generateOptionBackgroundColour(null, false, props.altBackgroundColour, props.backgroundColour, props.invert)),
        boxShadow: 'none !important',
      },
    }),
    indicatorsContainer: (styles) => ({
      ...styles,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      padding: '0px 2px',
    }),
    multiValue: (styles) => ({
      ...styles,
      margin: '2px',
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      border: 'none',
      backgroundColor: props.invert
        ? darken(0.05, props.altBackgroundColour)
        : darken(0.05, props.backgroundColour),
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      color: props.textColour,
      backgroundColor: props.invert
        ? darken(0.05, props.altBackgroundColour)
        : darken(0.05, props.backgroundColour),
      border: 'none',
      '&:hover': {
        color: props.textColour,
        backgroundColor: props.invert
          ? darken(0.05, props.altBackgroundColour)
          : darken(0.05, props.backgroundColour),
        cursor: 'pointer',
      },
      '> svg': {
        height: '12px',
        width: '12px',
      },
    }),
    clearIndicator: (styles) => ({
      ...styles,
      color: props.backgroundColour
        ? readableColor(
            props.backgroundColour,
            props.textColour,
            props.altTextColour,
            true,
          )
        : props.invert
        ? props.altTextColour
        : props.textColour,
      backgroundColor: 'inherit',
      '&:hover': {
        color: props.backgroundColour
          ? readableColor(
              props.backgroundColour,
              props.textColour,
              props.altTextColour,
              true,
            )
          : props.invert
          ? props.altTextColour
          : props.textColour,
        backgroundColor: 'inherit',
        cursor: 'pointer',
      },
      '> svg': {
        height: '16px',
        width: '16px',
      },
    }),

    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: () =>
      props.hideDropdownIndicator ? { display: 'none' } : { display: 'auto' },
    noOptionsMessage: () => ({
      fontSize: props.fontSize,
      fontWeight: 400,
      padding: '0px 5px',
    }),
  }
}
