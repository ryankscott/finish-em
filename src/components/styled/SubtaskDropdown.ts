import styled from 'styled-components'

interface SelectContainerProps {
    visible: boolean
}
export const SelectContainer = styled.div<SelectContainerProps>`
    position: absolute;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    display: ${(props) => (!props.visible ? 'none' : 'flex')};
    top: 0px;
`

interface ContainerProps {
    completed: boolean
}
export const Container = styled.div<ContainerProps>`
    text-decoration: ${(props) => (props.completed == true ? 'line-through' : null)};
`
export const Project = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 2px 2px 2px 2px;
    padding: 2px 4px;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    color: ${(props) => props.theme.colours.altTextColour};
    background-color: ${(props) => props.theme.colours.primaryColour};
    border-radius: 5px;
`
