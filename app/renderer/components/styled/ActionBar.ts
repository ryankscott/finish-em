import { darken } from 'polished'
import styled from '../../StyledComponents'
export const Container = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-auto-rows: 20px 40px;
  grid-template-areas:
    'ITEMS  ITEMS  ITEMS  ITEMS ITEMS'
    'DUE SCHEDULED PROJECT COMPLETE DELETE';
  align-items: center;
  bottom: 0px;
  height: 60px;
  width: 100%;
  padding: 5px;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  max-width: 650px;
  background-color: ${(props) => props.theme.colours.altBackgroundColour};
  color: ${(props) => props.theme.colours.altTextColour};
  border-radius: 5px;
  z-index: 99;
  box-shadow: 0px 1px -2px ${(props) => darken(0.2, props.theme.colours.altBackgroundColour)};
`
