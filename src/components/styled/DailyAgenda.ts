import styled from 'styled-components'
import { Title } from '../Typography'
import { Calendar } from 'react-big-calendar'

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

export const StyledCalendar = styled(Calendar)`
    min-height: 200px;
    .rbc-agenda-view {
        width: 500px;
        .rbc-agenda-table {
            padding: 0px;
            border-spacing: 0;
            border-collapse: separate;
            border-radius: 5px 5px 0px 0px;
        }
    }
    .rbc-header {
        font-size: ${(props) => props.theme.fontSizes.regular};
        font-weight: ${(props) => props.theme.fontWeights.regular};
    }
    .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
        padding: 10px;
        border-bottom: 0px;
    }
    .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
        padding: 5px 10px;
    }
    .rbc-agenda-content .rbc-agenda-table {
        border-radius: 0px 0px 5px 5px;
    }
    .rbc-agenda-date-cell {
        border: 0px;
    }
    .rbc-agenda-time-cell {
        border: 0px;
        border-left: 1px solid ${(props) => props.theme.colours.borderColour};
    }
`
