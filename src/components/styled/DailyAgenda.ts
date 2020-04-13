import styled from 'styled-components'

export const DateContainer = styled.div`
  display: grid;
  grid-template-rows: 4fr 1fr;
  grid-template-areas:
    'day day day day'
    'week_of_year . . week_of_quarter';
  margin-bottom: 10px;
  width: 100%;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px 0px;
  width: 100%;
`

export const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 50px;
  width: 100%;
  align-items: center;
  width: 675px;
`
