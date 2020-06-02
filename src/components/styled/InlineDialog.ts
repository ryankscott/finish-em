import styled from 'styled-components'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    position: absolute;
    box-sizing: border-box;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    flex-direction: column;
    background-color: ${(props) => props.theme.colours.dialogBackgroundColour};
    padding: 2px;
    margin: 2px;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    transition: all 0.1s ease-in-out;
    z-index: 100;
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
`

export const HeaderContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    width: 100%;
    margin: 0px;
    padding: 0px;
`

export const BodyContainer = styled.div`
    margin: 0px;
    padding: 5px;
`
