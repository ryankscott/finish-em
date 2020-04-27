import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: row;
    margin: 0px;
    width: 100%;
    height: 100vmax;
`

export const ShortcutIcon = styled.div`
    position: fixed;
    bottom: 10px;
    right: 10px;
    :hover {
        cursor: pointer;
    }
`
interface MainContainerProps {
    visible: boolean
}
export const MainContainer = styled.div<MainContainerProps>`
    display: flex;
    flex-direction: column;
    padding: 10px 20px;
    margin-left: ${(props) => (props.visible ? '270px' : '0px')};
    transition: all 0.2s ease-in-out;
    width: 100%;
    align-items: center;
    overflow: auto;
`

interface FocusContainerProps {
    visible: boolean
}
export const FocusContainer = styled.div<FocusContainerProps>`
    display: flex;
    flex-direction: column;
    padding: ${(props) => (props.visible ? '5px 15px' : '0px')};
    width: ${(props) => (props.visible ? '600px' : '0px')};
    transition: all 0.2s ease-in-out;
    align-items: center;
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    height: 100vmax;
`
