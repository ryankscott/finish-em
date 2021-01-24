import styled from 'styled-components'
import { IconType } from '../../interfaces'

interface ContainerProps {
  completed: boolean
  type: IconType
  position: 'center' | 'flex-end' | 'flex-start'
}

export const Container = styled.div<ContainerProps>`
  width: 100%;
  display: flex;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  color: ${(props) => props.theme.colours.textColour};
  border-radius: 5px;
  text-decoration: ${(props) => (props.completed == true ? 'line-through' : null)};
  justify-content: ${(props) => props.position};
  margin-left: ${(props) => (props.position == 'flex-start' ? '32px' : '0px')};
`
