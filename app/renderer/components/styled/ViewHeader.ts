import styled from 'styled-components'
import { Title } from '../Typography'

export const IconContainer = styled.div`
  padding: 5px;
  grid-area: icon;
`

export const HeaderContainer = styled.div`
  justify-content: flex-start;
  padding: 20px 5px;
  position: relative;
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: 50px 1fr 60px;
  grid-template-areas: 'icon title buttons';
`

export const HeaderTitle = styled(Title)`
  grid-area: title;
  padding: 5px;
  margin: 0px;
`
