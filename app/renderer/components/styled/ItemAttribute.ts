import styled from 'styled-components'
import { Paragraph } from '../Typography'

interface AttributeContainerProps {
  completed: boolean
  compact: boolean
}
export const AttributeContainer = styled.div<AttributeContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0px 2px;
  margin: 0px 2px;
  text-decoration: ${(props) => (props.completed ? 'strike-through' : 'none')};
`
interface AttributeIconProps {
  completed: boolean
  compact: boolean
}
export const AttributeIcon = styled.div<AttributeContainerProps>`
  display: flex;
  padding-right: 2px;
  align-items: center;
`
interface AttributeTextProps {
  completed: boolean
  compact: boolean
}
export const AttributeText = styled(Paragraph)<AttributeTextProps>`
  > p {
    margin: ${(props) => (props.compact ? '2px 0px' : '2px')};
    color: ${(props) => props.theme.colours.disabledTextColour};
    font-size: ${(props) =>
      props.compact ? props.theme.fontSizes.xxxsmall : props.theme.fontSizes.xxsmall};
  }
  margin: 0px 1px;
`
