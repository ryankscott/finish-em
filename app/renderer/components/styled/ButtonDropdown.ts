import styled from 'styled-components'

export const SelectContainer = styled.div`
  position: absolute;
  flex-direction: column;
  padding: 0px;
  margin: 2px;
  display: flex;
  top: 0px;
  min-width: 120px;
`

interface ContainerProps {
  completed: boolean
}
export const Container = styled.div<ContainerProps>`
  text-decoration: ${(props) => (props.completed == true ? 'line-through' : null)};
  width: 100%;
  display: flex;
  position: relative;
  justify-content: center;
  padding: 0px;
  margin: 0px;
`
