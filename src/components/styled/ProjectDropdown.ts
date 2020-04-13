import styled from 'styled-components'

interface ContainerProps {
  visible: boolean
}
export const Container = styled.div<ContainerProps>`
  position: inline;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 35px;
  padding: 0px;
  display: ${(props) => (!props.visible ? 'none' : null)};
  background-color: #fff;
  width: 250px;
`
