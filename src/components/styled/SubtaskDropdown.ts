import styled from 'styled-components'
import { Paragraph } from '../Typography'

interface ContainerProps {
    visible: boolean
}
export const Container = styled.div<ContainerProps>`
    position: fixed;
    display: flex;
    flex-direction: column;
    padding: 0px;
    margin: 0px;
    display: ${(props) => (!props.visible ? 'none' : null)};
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
export const DisabledContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`
export const DisabledText = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
`
