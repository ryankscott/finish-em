import styled from 'styled-components'
import CSS from 'csstype'
import { darken } from 'polished'
import { fontSizeType } from '../../interfaces'
interface ContainerProps {
    width: number
    height: number
    readOnly: boolean
    editing: boolean
    valid: boolean
    backgroundColour: CSS.Color
    fontSize: fontSizeType
}

export const Container = styled.div<ContainerProps>`
    box-sizing: border-box;
    overflow: hidden;
    overflow-y: scroll;
    height: ${(props) => props.height || 'auto'};
    width: ${(props) => props.width || '100%'};
    margin: 0px;
    min-height: 25px;
    padding: 5px 5px;
    padding-left: 10px;
    border-radius: 5px;
    border: 1px solid;
    font-size: ${(props) => (props.fontSize ? props.theme.fontSizes[props.fontSize] : 'auto')};
    border-color: ${(props) =>
        props.backgroundColour
            ? darken(0.1, props.backgroundColour)
            : props.editing
            ? props.backgroundColour
                ? props.backgroundColour
                : props.theme.colours.borderColour
            : 'transparent'};
    cursor: ${(props) => (props.readOnly ? 'default' : 'text')};
    color: ${(props) => (props.valid ? 'auto' : props.theme.colours.errorColour)};
    background-color: ${(props) => (props.backgroundColour ? props.backgroundColour : 'inherit')};
    &:hover {
        background-color: ${(props) =>
            props.backgroundColour
                ? darken(0.1, props.backgroundColour)
                : props.readOnly
                ? 'inherit'
                : props.theme.colours.focusBackgroundColour};
    }
    &:focus {
        background-color: ${(props) =>
            props.backgroundColour
                ? darken(0.1, props.backgroundColour)
                : props.readOnly
                ? 'inherit'
                : props.theme.colours.focusBackgroundColour};
    }
    & > p {
        padding: 0px 0px;
        margin: 0px;
    }
    outline: 0;
    :active {
        outline: 0;
    }
`
