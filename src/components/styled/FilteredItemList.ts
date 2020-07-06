import Select from 'react-select'
import styled from 'styled-components'
import { Paragraph } from '../Typography'
import { lighten } from 'polished'

export const HeaderBar = styled.div`
    display: grid;
    align-items: center;
    width: 100%;
    padding: 5px;
    border-radius: 5px;
    grid-template-rows: 40px;
    grid-template-columns: 30px 160px auto;
    grid-template-areas: 'hide header filterBar';
`

export const FilterBar = styled.div`
    position: relative;
    grid-area: filterBar;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
`

export const HideButtonContainer = styled.div`
    grid-area: hide;
`

export const ItemListContainer = styled.div`
    width: 100%;
    display: flex;
    transition: 0.2s ease-in-out;
    padding: 0px 15px;
`

export const SortContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    position: relative;
    transition: 0.2s ease-in-out;
`

export const SortSelect = styled(Select)`
    width: 125px;
    caret-color: transparent;
    padding: 0px 2px;
    display: flex;
    flex-direction: column;
    top: 1px;
    right: 30px;
`

export const ListHeader = styled.div`
    display: flex;
    flex-direction: row;
    font-size: ${(props) => props.theme.fontSizes.regular};
    grid-area: header;
    padding: 2px 0px;
    margin: 0px;
    align-self: center;
`
export const ListItemCount = styled(Paragraph)`
    padding: 0px 5px;
    color: ${(props) => lighten(0.2, props.theme.colours.textColour)};
`

export const Container = styled.div`
    margin: 10px 0px;
    padding: 10px 0px;
    width: 100%;
    border-radius: 5px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
`
