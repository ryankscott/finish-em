import styled from 'styled-components'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    position: absolute;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    display: ${(props) => (!props.visible ? 'none' : 'flex')};
`
export const DisabledContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: ${(props) => props.theme.colours.primaryColour};
    border-radius: 5px;
    padding: 2px 5px;
`
