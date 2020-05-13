import styled from 'styled-components'

interface ContainerProps {
    width: number
    height: number
    readOnly: boolean
    editing: boolean
    valid: boolean
}

export const Container = styled.div<ContainerProps>`
    overflow: hidden;
    overflow-y: scroll;
    height: ${(props) => props.height || 'auto'};
    width: ${(props) => props.width || '100%'};
    margin: 0px;
    padding: 5px 5px;
    padding-left: 10px;
    min-height: 26px;
    border-radius: 5px;
    border: 1px solid;
    border-color: ${(props) =>
        props.editing ? props.theme.colours.borderColour : 'transparent'};
    cursor: ${(props) => (props.readOnly ? 'default' : 'text')};
    background-color: rgba(0, 0, 0, 0.01);
    color: ${(props) =>
        props.valid ? 'auto' : props.theme.colours.errorColour};
    &:hover {
        background-color: ${(props) =>
            props.readOnly ? 'rgba(0,0,0, 0.01)' : 'rgba(0,0,0, 0.05)'};
    }
    &:focus {
        background-color: ${(props) =>
            props.readOnly ? 'rgba(0,0,0, 0.01)' : 'rgba(0,0,0, 0.05)'};
    }
    & > p {
        padding: 0px 0px;
        margin: 0px;
    }
`
