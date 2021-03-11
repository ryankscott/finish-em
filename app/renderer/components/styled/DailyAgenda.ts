import styled from '../../StyledComponents'
import { Title } from '../Typography'
import { darken } from 'polished'

export const DateContainer = styled.div`
  display: grid;
  grid-template-rows: 6fr 1fr;
  grid-template-areas:
    'back day day day day forward'
    'week_of_year . . . . week_of_quarter';
  margin-bottom: 10px;
  width: 100%;
  align-items: baseline;
`

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0px 5px;
  padding: 0px 5px;
  width: 100%;
`

export const AgendaContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 20px;
  padding: 20px 20px;
  width: 100%;
  max-width: 700px;
  align-items: center;
`

export const BackContainer = styled.div`
  grid-area: back;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`

export const ForwardContainer = styled.div`
  grid-area: forward;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
`

export const DailyTitle = styled(Title)`
  grid-area: day;
  display: flex;
  justify-content: center;
`

export const EventsContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 10px;
  margin-top: 20px;
  background-color: ${(props) => darken(0.02, props.theme.colours.backgroundColour)};
  width: 100%;
  border-radius: 5px;
`

export const EventContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 2px;
  width: 100%;
`

export const EventTime = styled.div`
  width: 130px;
  padding: 2px 5px;
  color: ${(props) => props.theme.colours.primaryColour};
`

export const EventTitle = styled.div`
  padding: 2px 5px;
`
export const EventDescription = styled.div`
  padding: 2px 5px;
`

export const RefreshContainer = styled.div`
  position: absolute;
  width: 32px;
  height: 32px;
  right: 5px;
  top: 5px;
`
