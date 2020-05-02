import styled from 'styled-components'

interface ContainerProps {
    isSubtask: boolean
    noIndentOnSubtasks: boolean
}
export const Container = styled.div<ContainerProps>`
    transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
    max-height: 200px;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.medium};
    display: grid;
    opacity: ${(props) => (props.hidden ? '0' : '1')};
    grid-template-columns: ${(props) =>
        props.isSubtask && !props.noIndentOnSubtasks
            ? '60px 30px repeat(20, 1fr)'
            : '30px 30px repeat(20, 1fr)'};
    grid-auto-rows: minmax(20px, auto);
    grid-template-areas:
        'EXPAND TYPE DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC PROJECT PROJECT PROJECT'
        '.  SCHEDULED SCHEDULED SCHEDULED SCHEDULED . . . . DUE DUE DUE DUE . . . . REPEAT REPEAT REPEAT REPEAT REPEAT';
    border-bottom: ${(props) => (props.hidden ? '0px' : '1px solid')};
    border-top: ${(props) => (props.hidden ? '0px' : '1px solid')};
    border-color: ${(props) => props.theme.colours.borderColour};
    padding: ${(props) => (props.hidden ? '0px' : '5px 5px 5px 5px')};
    align-items: center;
    cursor: pointer;
    color: ${(props) => props.theme.colours.defaultTextColour};
    :focus {
        background-color: ${(props) =>
            props.theme.colours.focusBackgroundColour};
        border-color: ${(props) => props.theme.colours.focusBorderColour};
    }
`
interface QuickAddProps {
    visible: boolean
}
export const QuickAdd = styled.div<QuickAddProps>`
    display: ${(props) => (props.visible ? 'block' : 'none')};
`

interface BodyProps {
    completed: boolean
}
export const Body = styled.div<BodyProps>`
    margin: 5px 10px;
    grid-area: DESC;
    font-size: ${(props) => props.theme.fontSizes.regular};
    text-decoration: ${(props) =>
        props.completed === true ? 'line-through' : null};
`

export const ExpandContainer = styled.div`
    grid-area: EXPAND;
    display: flex;
`
export const TypeContainer = styled.div`
    grid-area: TYPE;
    display: flex;
`
export const ScheduledContainer = styled.div`
    grid-area: SCHEDULED;
    display: flex;
    justify-content: flex-start;
`
export const DueContainer = styled.div`
    grid-area: DUE;
    display: flex;
    justify-content: center;
`
export const RepeatContainer = styled.div`
    grid-area: REPEAT;
    display: flex;
    justify-content: flex-end;
`
