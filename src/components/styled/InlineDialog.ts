import styled from 'styled-components'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    position: absolute;
    box-sizing: border-box;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    flex-direction: column;
    width: 200px;
    background-color: ${(props) =>
        props.theme.colours.lightDialogBackgroundColour};
    padding: 5px 5px 8px 5px;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    margin: 2px;
    transition: all 0.1s ease-in-out;
    z-index: 99;
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
