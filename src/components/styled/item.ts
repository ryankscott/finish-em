import styled from 'styled-components'
import CSS from 'csstype'
import { transparentize } from 'polished'

interface ContainerProps {
    labelColour: CSS.Color
    visible: boolean
    shouldIndent: boolean
}
export const Container = styled.div<ContainerProps>`
    transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
    max-height: 200px;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.medium};
    display: ${(props) => (props.visible ? 'grid' : 'none')};
    opacity: ${(props) => (props.hidden ? '0' : '1')};
    margin: 1px 0px;
    margin-left: ${(props) => (props.shouldIndent ? '20px' : '0px')};
    grid-template-columns: 5px 30px 30px repeat(20, 1fr);
    grid-auto-rows: 30px 15px;
    grid-template-areas:
        '. EXPAND TYPE DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC DESC PROJECT PROJECT PROJECT PROJECT MORE'
        '. . PARENT PARENT PARENT PARENT PARENT SCHEDULED SCHEDULED SCHEDULED SCHEDULED SCHEDULED DUE DUE DUE DUE DUE REPEAT REPEAT REPEAT REPEAT REPEAT REPEAT';
    border: 0px;
    padding: ${(props) => (props.hidden ? '0px' : '5px')};
    align-items: center;
    cursor: pointer;
    border-radius: 5px;
    color: ${(props) => props.theme.colours.disabledTextColour};
    background-color: ${(props) =>
        props.labelColour != null
            ? transparentize(0.8, props.labelColour)
            : props.theme.colours.backgroundColour};
    :focus {
        background-color: ${(props) =>
            props.labelColour != null
                ? transparentize(0.8, props.labelColour)
                : props.theme.colours.focusBackgroundColour};
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
    margin: 0px 5px;
    grid-area: DESC;
    font-size: ${(props) => props.theme.fontSizes.regular};
    text-decoration: ${(props) => (props.completed === true ? 'line-through' : null)};
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

export const ProjectName = styled.div`
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    color: ${(props) => props.theme.colours.altTextColour};
    border-radius: 5px;
    border: 1px solid;
    padding: 2px 5px;
    border-color: ${(props) => props.theme.colours.primaryColour};
    background-color: ${(props) => props.theme.colours.primaryColour};
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
interface ParentItemContainerProps {
    visible: boolean
}
export const ParentItemContainer = styled.div<ParentItemContainerProps>`
    grid-area: PARENT;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: flex-start;
`
interface MoreContainerProps {
    visible: boolean
}
export const MoreContainer = styled.div<MoreContainerProps>`
    grid-area: MORE;
    transition: all 0.2s ease-in-out;
    position: relative;
    display: ${(props) => (props.visible ? 'flex' : 'none')};
    justify-content: flex-end;
`

interface HorizontalRuleProps {
    visible: boolean
    labelColour: CSS.Color
}

export const HorizontalRule = styled.hr<HorizontalRuleProps>`
    margin: auto;
    padding: 0px;
    display: ${(props) => (props.visible ? 'inherit' : 'none')};
    height: 1px;
    width: 90%;
    border: none;
    background-color: ${(props) =>
        props.labelColour
            ? transparentize(0.9, props.labelColour)
            : props.theme.colours.focusBackgroundColour};
`
