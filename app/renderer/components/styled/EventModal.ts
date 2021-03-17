import styled from '../../StyledComponents'
export const AttributeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  margin: 2px 20px;
  min-height: 30px;
`
export const AttributeKey = styled.div`
  display: flex;
  justify-content: flex-start;
  font-weight: bold;
  align-items: center;
  margin-left: 0px;
  min-width: 100px;
`
export const AttributeValue = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  min-width: 180px;
  text-overflow: ellipsis;
`
