import styled from 'styled-components'

export const ProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 20px;
  padding: 20px 20px;
  margin-top: 50px; /* Note: This is because there's less padding on the editable title */
  width: 100%;
  max-width: 700px;
`

export const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0px;
`
export const AddProjectContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 5px 0px;
  width: 100%;
`

export const StaleContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
`
