import styled from 'styled-components'
import CSS from 'csstype'
import { transparentize } from 'polished'

interface ContainerProps {
    isSubtask: boolean
    noIndentOnSubtasks: boolean
    labelColour: CSS.Color
}
export const Container = styled.div<ContainerProps>`
    transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
    max-height: 200px;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.medium};
    display: grid;
    opacity: ${(props) => (props.hidden ? '0' : '1')};
    margin-left: ${(props) =>
        props.isSubtask && !props.noIndentOnSubtasks ? '20px' : '0px'};
    grid-template-columns: 5px 30px 30px repeat(20, 1fr);
    grid-auto-rows: minmax(20px, auto);
    grid-template-areas:
        'LABEL EXPAND TYPE DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC PROJECT PROJECT PROJECT PROJECT MORE'
        'LABEL . SUBTASK SUBTASK SUBTASK . SCHEDULED SCHEDULED SCHEDULED SCHEDULED . . DUE DUE DUE DUE . . REPEAT REPEAT REPEAT REPEAT REPEAT';
    border: ${(props) => (props.hidden ? '0px' : '1px solid')};
    border-color: ${(props) => props.theme.colours.borderColour};
    padding: ${(props) => (props.hidden ? '0px' : '5px 5px 5px 0px')};
    align-items: center;
    cursor: pointer;
    color: ${(props) => props.theme.colours.textColour};
    background-color: ${(props) =>
        props.labelColour != null
            ? transparentize(0.9, props.labelColour)
            : props.theme.colours.backgroundColour};
    :focus {
        background-color: ${(props) =>
            props.labelColour != null
                ? transparentize(0.8, props.labelColour)
                : props.theme.colours.focusBackgroundColour};
        border-color: ${(props) => props.theme.colours.focusBorderColour};
    }
`
interface QuickAddProps {
    visible: boolean
}
export const QuickAdd = styled.div<QuickAddProps>`
    display: ${(props) => (props.visible ? 'block' : 'none')};
    border: 1px solid;
    border-radius: 5px;
    border-color: ${(props) => props.theme.colours.borderColour};
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
    display: 'flex';
`
interface ProjectContainerProps {
    visible: boolean
}
export const ProjectContainer = styled.div<ProjectContainerProps>`
    grid-area: PROJECT;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: flex-end;
`

interface ScheduledContainerProps {
    visible: boolean
}
export const ScheduledContainer = styled.div<ScheduledContainerProps>`
    grid-area: SCHEDULED;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: center;
`

interface DueContainerProps {
    visible: boolean
}
export const DueContainer = styled.div<DueContainerProps>`
    grid-area: DUE;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: center;
`
interface RepeatContainerProps {
    visible: boolean
}
export const RepeatContainer = styled.div<RepeatContainerProps>`
    grid-area: REPEAT;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: center;
`
interface ConvertSubtaskContainerProps {
    visible: boolean
}
export const ConvertSubtaskContainer = styled.div<ConvertSubtaskContainerProps>`
    grid-area: SUBTASK;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: flex-start;
`
interface MoreContainerProps {
    visible: boolean
}
export const MoreContainer = styled.div<MoreContainerProps>`
    grid-area: MORE;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: flex-end;
`

interface LabelContainerProps {
    stale: boolean
    labelColour: CSS.Color
}

export const LabelContainer = styled.div<LabelContainerProps>`
    grid-area: LABEL;
    background: ${(props) =>
        props.labelColour
            ? props.labelColour
            : props.stale
            ? `repeating-linear-gradient(-45deg, ${props.theme.colours.backgroundColour}, ${props.theme.colours.backgroundColour} 0px, ${props.theme.colours.borderColour} 3px, ${props.theme.colours.borderColour} 6px)`
            : props.theme.colours.borderColour};
    height: calc(100% + 10px);
    width: 100%;
`
