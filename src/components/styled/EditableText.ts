import styled from '../../StyledComponents'
import CSS from 'csstype'
import { darken, readableColor } from 'polished'
import { fontSizeType } from '../../interfaces'
interface ContainerProps {
    width: number
    height: number
    readOnly: boolean
    editing: boolean
    valid: boolean
    backgroundColour: CSS.Property.BackgroundColor
    fontSize: fontSizeType
    padding: CSS.Property.Padding
}

export const Container = styled.div<ContainerProps>`
    position: relative;
    box-sizing: border-box;
    pointer-events: ${(props) => (props.readOnly ? 'none' : 'inherit')};
    overflow: hidden;
    overflow-y: scroll;
    height: ${(props) => props.height || 'auto'};
    width: ${(props) => props.width || '100%'};
    margin: 0px;
    min-height: 25px;
    padding: ${(props) => (props.padding ? props.padding : '5px 5px 5px 10px')};
    border-radius: 5px;
    border: ${(props) => (props.editing ? '1px solid' : 'none')};
    font-size: ${(props) => (props.fontSize ? props.theme.fontSizes[props.fontSize] : 'auto')};
    border-color: ${(props) =>
        props.backgroundColour
            ? darken(0.1, props.backgroundColour)
            : props.backgroundColour
            ? props.backgroundColour
            : props.theme.colours.borderColour};
    cursor: ${(props) => (props.readOnly ? 'default' : 'text')};
    color: ${(props) =>
        props.valid
            ? props.backgroundColour
                ? readableColor(
                      props.backgroundColour,
                      props.theme.colours.altTextColour,
                      props.theme.colours.textColour,
                      true,
                  )
                : 'inherit'
            : props.theme.colours.errorColour};
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
    & > span.valid {
        background-color: ${(props) => props.theme.colours.penternaryColour};
        color: ${(props) => props.theme.colours.altTextColour};
        padding: 2px 5px;
        border-radius: 3px;
    }
    & > span.invalid {
        color: ${(props) => props.theme.colours.errorColour};
        padding: 2px 5px;
        border-radius: 3px;
        border: 1px solid;
        border-color: ${(props) => props.theme.colours.errorColour};
    }
`

interface ContainerProps {
    backgroundColour: CSS.Property.BackgroundColor
}

export const Placeholder = styled.div`
    position: absolute;
    left: 5px;
    top: 5px;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    color: ${(props) => props.theme.colours.disabledTextColour};
`
