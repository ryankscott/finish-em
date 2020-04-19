import styled from 'styled-components'
import { Paragraph } from '../Typography'

interface ShortcutContainerProps {
    isOpen: boolean
}
export const ShortcutContainer = styled.div<ShortcutContainerProps>`
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
    position: fixed;
    background-color: ${(props) => props.theme.colours.altBackgroundColour};
    color: ${(props) => props.theme.colours.altTextColour};
    opacity: 0.85;
    width: 650px;
    top: 50%;
    left: calc(50% + 145px);
    transform: translate(-50%, -50%);
    padding: 2px;
    z-index: 99;
    height: 600px;
`

export const Header = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: baseline;
    margin-bottom: 20px;
`

export const Controls = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding: 2px;
`

export const Body = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: center;
`

export const Row = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`

export const Data = styled.div`
    display: flex;
    width: 50%;
    justify-content: center;
`

export const ShortcutTable = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`

export const ShortcutName = styled(Paragraph)`
    width: 180px;
    color: ${(props) => props.theme.colours.altTextColour};
`

export const ShortcutKeys = styled(Paragraph)`
    width: 40px;
    color: ${(props) => props.theme.colours.primaryColour};
`
