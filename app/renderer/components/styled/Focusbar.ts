import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  padding: 10px 5px;
  height: 100vh;
  z-index: 0;
`
export const SubtaskContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0px;
  padding: 5px;
  margin-top: 30px;
`
export const AttributeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  margin: 2px 20px;
  min-height: 30px;
`
export const AttributeKey = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-left: 0px;
  min-width: 100px;
`
export const AttributeValue = styled.div`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  min-width: 180px;
  text-overflow: ellipsis;
`

export const TitleContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0px;
  padding: 20px 5px 0px 5px;
  align-items: flex-start;
  width: 320px;
  min-height: 100px;
`
interface HeaderContainerProps {
  visible: boolean
}
export const HeaderContainer = styled.div<HeaderContainerProps>`
  display: ${(props) => (props.visible ? 'grid' : 'none')};
  grid-template-areas: 'UP . . . CLOSE';
  grid-template-columns: repeat(5, 1fr);
  flex-direction: row;
  width: 100%;
  margin: 0px;
  padding: 0px;
`

export const Project = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  margin: 2px;
  padding: 4px 8px;
  font-size: ${(props) => props.theme.fontSizes.xsmall};
  color: ${(props) => props.theme.colours.altTextColour};
  background-color: ${(props) => props.theme.colours.primaryColour};
  border-radius: 5px;
`
