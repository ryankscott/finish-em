import { darken, lighten } from 'polished'
import styled from '../../StyledComponents'

export interface WrapperProps {
  hideBorder: boolean
  isEditing: boolean
}
export const Wrapper = styled.div<WrapperProps>`
  position: relative;
  width: 100%;

  .ql-preview {
    text-decoration: underline;
    color: ${(props) => props.theme.colours.altTextColour};
  }

  .ql-editor.ql-blank::before {
    font-weight: ${(props) => props.theme.fontWeights.regular};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-style: normal;
    opacity: 0.7;
    left: 10px;
  }

  .ql-remove {
    color: ${(props) => props.theme.colours.errorColour};
  }

  .ql-editor {
    padding: 6px 8px;
    border-radius: 5px;
    border: ${(props) => (props.hideBorder ? 'none' : '1px solid')};
    border-color: ${(props) => props.theme.colours.borderColour};
    &:hover {
      background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
    &:focus {
      background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
  }

  .ql-container {
    border: none;
  }

  .ql-snow .ql-editor a {
    color: ${(props) => props.theme.colours.textColour};
  }

  /* Tooltip styling */
  .ql-tooltip {
    left: 0px;
    border-radius: 5px;
    color: ${(props) => props.theme.colours.altTextColour};
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
  }

  .ql-action {
    border-radius: 5px;
    padding: 4px;
    color: ${(props) => props.theme.colours.altTextColour};
  }

  .ql-action:hover {
  }

  /* Toolbar styling */

  .ql-toolbar {
    display: ${(props) => (props.isEditing ? 'flex' : 'none')};
    padding: 2px;
    border-radius: 5px;
    background-color: ${(props) => props.theme.colours.focusDialogBackgroundColour};
    border: 1px solid ${(props) => props.theme.colours.borderColour};
    position: absolute;
    bottom: 0;
    width: 100%;
    transform: translateY(100%);
    transition: all 0.2s ease-in-out;
  }

  .ql-toolbar.ql-snow .ql-formats {
    margin-right: 5px;
  }
  .ql-stroke {
    stroke-width: 0.9;
  }

  .ql-stroke.ql-thin {
    stroke-width: 0.8;
  }

  .ql-snow.ql-toolbar button {
    border-radius: 3px;
  }

  .ql-snow.ql-toolbar button:hover .ql-stroke {
    color: ${(props) => props.theme.colours.textColour};
    stroke: ${(props) => props.theme.colours.textColour};
  }
  .ql-snow.ql-toolbar button:hover .ql-fill {
    fill: ${(props) => props.theme.colours.textColour};
  }

  .ql-snow.ql-toolbar button:hover {
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) => darken(0.05, props.theme.colours.focusDialogBackgroundColour)};
  }
`
