import styled from 'styled-components'
import { Title } from '../Typography'

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
    margin: 10px 0px;
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
