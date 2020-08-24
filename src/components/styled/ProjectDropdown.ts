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
