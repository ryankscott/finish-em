import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
`
export interface ItemCreatorContainer {
    visible: boolean
    width: string
}
export const ItemCreatorContainer = styled.div<ItemCreatorContainer>`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: ${(props) => (props.visible ? (props.width ? props.width : '100%') : '0px')};
    opacity: ${(props) => (props.visible ? '1' : '0')};
    transition: width 0.2s ease-in-out;
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    :hover {
        background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
`

export const HelpButtonContainer = styled.div`
    position: absolute;
    right: 2px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 2px;
    background-color: inherit;
`
