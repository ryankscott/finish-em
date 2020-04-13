import styled from 'styled-components'

export const NoItemText = styled.p`
  color: ${(props) => props.theme.colours.disabledTextColour};
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.small};
  padding-left: 10px;
`

export const Container = styled.div`
  width: 100%;
  margin: 10px 0px;
`
