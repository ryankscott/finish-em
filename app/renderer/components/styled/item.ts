import styled, { keyframes } from '../../StyledComponents'
import CSS from 'csstype'
import { darken, transparentize } from 'polished'

const load = keyframes`
  from {
      left: -150px;
  }
  to   {
      left: 100%;
  }
`

export const LoadingContainer = styled.div`
  margin: 5px 0px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colours.backgroundColour};
  height: 60px;
  width: 100%;
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 25px 25px repeat(3, 1fr);
  grid-auto-rows: auto auto;
  grid-template-areas:
    '. LTYPE  LDESC  LDESC  LDESC '
    '. .      LDUE  LSCHEDULED  LREPEAT ';
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 0px auto;
    height: 1px;
    width: calc(100% - 10px);
    border-bottom: 1px solid;
    border-color: ${(props) => props.theme.colours.focusBackgroundColour};
  }
`

export const LoadingDue = styled.div`
  grid-area: LDUE;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  margin: 2px 10px;
  height: 20px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -50px;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${(props) => darken(0.05, props.theme.colours.focusBackgroundColour)} 50%,
      transparent 100%
    );
    animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

export const LoadingScheduled = styled.div`
  grid-area: LSCHEDULED;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  margin: 2px 10px;
  height: 20px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -50px;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${(props) => darken(0.05, props.theme.colours.focusBackgroundColour)} 50%,
      transparent 100%
    );
    animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

export const LoadingRepeat = styled.div`
  grid-area: LREPEAT;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  margin: 2px 10px;
  height: 20px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -50px;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${(props) => darken(0.05, props.theme.colours.focusBackgroundColour)} 50%,
      transparent 100%
    );
    animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

export const LoadingDesc = styled.div`
  grid-area: LDESC;
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  margin: 2px 10px;
  height: 25px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -50px;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${(props) => darken(0.05, props.theme.colours.focusBackgroundColour)} 50%,
      transparent 100%
    );
    animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

export const LoadingType = styled.div`
  grid-area: LTYPE;
  position: relative;
  overflow: hidden;
  padding: 2px;
  margin: 2px 0px;
  border-radius: 50%;
  height: 25px;
  background-color: ${(props) => props.theme.colours.focusBackgroundColour};
  &:before {
    content: '';
    display: block;
    position: absolute;
    left: -50px;
    top: 0;
    height: 100%;
    width: 50px;
    background: linear-gradient(
      to right,
      transparent 0%,
      ${(props) => darken(0.05, props.theme.colours.focusBackgroundColour)} 50%,
      transparent 100%
    );
    animation: ${load} 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
`

const generateBackgroundColour = (props) => {
  if (props.deleted) {
    return `repeating-linear-gradient(45deg, ${darken(
      0.05,
      props.theme.colours.backgroundColour,
    )}, ${darken(0.05, props.theme.colours.backgroundColour)} 10px, ${darken(
      0.1,
      props.theme.colours.backgroundColour,
    )} 10px, ${darken(0.1, props.theme.colours.backgroundColour)} 20px)`
  }

  if (props.focused) {
    if (props.labelColour != null) {
      return transparentize(0.6, props.labelColour)
    }
    return props.theme.colours.focusBackgroundColour
  }
  if (props.labelColour != null) {
    return transparentize(0.8, props.labelColour)
  }
  return 'none'
}

interface ContainerProps {
  labelColour: CSS.Property.Color
  focused: boolean
  visible: boolean
  shouldIndent: boolean
  deleted: boolean
}
export const Container = styled.div<ContainerProps>`
  position: relative;
  transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
  max-height: 200px;
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) =>
    props.compact ? props.theme.fontSizes.small : props.theme.fontSizes.regular};
  display: ${(props) => (props.visible ? 'grid' : 'none')};
  opacity: ${(props) => (props.hidden ? '0' : '1')};
  margin: 1px 0px;
  margin-left: ${(props) => (props.shouldIndent ? '15px' : '0px')};
  grid-template-columns: ${(props) =>
    props.compact ? 'repeat(8, 1fr)' : '25px 25px repeat(4, 1fr) 25px 25px'};
  grid-auto-rows: auto auto;
  grid-template-areas: ${(props) =>
    props.compact
      ? `"DESC   DESC  DESC   DESC      DESC   DESC    DESC     PROJECT"
         "DUE    DUE   DUE    DUE       REPEAT REPEAT  REPEAT   REPEAT";`
      : `"EXPAND TYPE  DESC   DESC      DESC   PROJECT REMINDER MORE"
         ".      .     PARENT SCHEDULED DUE    REPEAT  .        .";`};
  padding: ${(props) => (props.hidden ? '0px' : props.compact ? '2px 4px' : '5px')};
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  color: ${(props) => props.theme.colours.disabledTextColour};
  background: ${(props) => generateBackgroundColour(props)};

  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 0px auto;
    height: 1px;
    width: calc(100% - 10px);
    border-bottom: 1px solid;
    border-color: ${(props) =>
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
  deleted: boolean
  compact: boolean
}
export const Body = styled.div<BodyProps>`
  margin: ${(props) => (props.compact ? '0px' : '0px 5px')};
  grid-area: DESC;
  color: ${(props) =>
    props.deleted ? props.theme.colours.disabledTextColour : props.theme.colours.textColour};
  font-size: ${(props) => props.theme.fontSizes.regular};
  text-decoration: ${(props) => (props.completed === true ? 'line-through' : null)};
`
export const ExpandContainer = styled.div`
  grid-area: EXPAND;
  display: flex;
`
export const TypeContainer = styled.div`
  grid-area: TYPE;
  display: flex;
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
interface ReminderContainerProps {
  visible: boolean
}

export const ReminderContainer = styled.div<ReminderContainerProps>`
  grid-area: REMINDER;
  transition: all 0.2s ease-in-out;
  position: relative;
  display: ${(props) => (props.visible ? 'flex' : 'none')};
  justify-content: flex-end;
`
