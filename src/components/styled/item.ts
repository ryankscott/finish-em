import styled from '../../StyledComponents'
import CSS from 'csstype'
import { transparentize } from 'polished'

interface ContainerProps {
  labelColour: CSS.Property.Color
  visible: boolean
  shouldIndent: boolean
  deleted: boolean
}
export const Container = styled.div<ContainerProps>`
  position: relative;
  transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
  max-height: 200px;
  max-width: 650px;
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.regular};
  display: ${(props) => (props.visible ? 'grid' : 'none')};
  opacity: ${(props) => (props.hidden ? '0' : '1')};
  margin: 1px 0px;
  margin-left: ${(props) => (props.shouldIndent ? '20px' : '0px')};
  grid-template-columns: 30px 30px repeat(4, 1fr) 25px 25px;
  grid-auto-rows: auto auto;
  grid-template-areas:
    '  EXPAND   TYPE    DESC         DESC         DESC        PROJECT    REMINDER     MORE'
    '  .        .       PARENT       SCHEDULED    DUE         REPEAT       .        .   ';

  padding: ${(props) => (props.hidden ? '0px' : '5px')};
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  color: ${(props) => props.theme.colours.disabledTextColour};
  background: ${(props) =>
    props.deleted
      ? `repeating-linear-gradient(45deg, #e9e9e9, #e9e9e9 10px, #eee 10px, #eee 20px)`
      : 'none'};
  background-color: ${(props) =>
    props.labelColour != null
      ? transparentize(0.8, props.labelColour)
      : props.theme.colours.backgroundColour};
  &:focus {
    background-color: ${(props) =>
      props.labelColour != null
        ? transparentize(0.8, props.labelColour)
        : props.theme.colours.focusBackgroundColour};
  }
  &:active {
    background-color: ${(props) =>
      props.labelColour != null
        ? transparentize(0.8, props.labelColour)
        : props.theme.colours.focusBackgroundColour};
  }

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
}
export const Body = styled.div<BodyProps>`
  margin: 0px 5px;
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
