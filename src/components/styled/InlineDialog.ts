import styled from 'styled-components'

interface DialogProps {
    placement: string
    buttonPosition: DOMRect
}

export const Dialog = styled.div<DialogProps>`
    position: fixed;
    box-sizing: border-box;
    display: flex;
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
    top: ${(props) =>
        props.buttonPosition ? props.buttonPosition.y + props.buttonPosition.height + 'px' : '0px'};
`

export const Container = styled.div`
    position: relative;
    display: flex;
    z-index: 100;
    box-shadow: ${(props) => '0px 1px 4px ' + props.theme.borderColour};
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
