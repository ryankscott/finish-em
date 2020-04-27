import styled from 'styled-components'

interface ContainerProps {
    width: number
    height: number
    readOnly: boolean
    editing: boolean
}
export const Container = styled.div<ContainerProps>`
    overflow: hidden;
    overflow-y: scroll;
    height: ${(props) => props.height || 'auto'};
    width: ${(props) => props.width || '100%'};
    margin: 2px 2px;
    padding: 5px 0px 5px 5px;
    cursor: ${(props) => (props.readOnly ? 'default' : 'text')};
    border: ${(props) => (props.editing ? '1px solid ' : 'none')};
    border-color: ${(props) => props.theme.colours.borderColour};
    &:hover {
        background-color: ${(props) =>
            props.readOnly
                ? props.theme.colours.backgroundColour
                : props.theme.colours.focusBackgroundColour};
    }
    &:focus {
        background-color: ${(props) =>
            props.theme.colours.focusBackgroundColour};
    }
    & > p {
        padding: 0px 0px;
        margin: 0px;
    }
`
