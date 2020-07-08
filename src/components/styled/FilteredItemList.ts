import Select from 'react-select'
import styled from 'styled-components'
import { Paragraph } from '../Typography'
import { lighten } from 'polished'

export const HeaderBar = styled.div`
    display: grid;
    align-items: center;
    width: 100%;
    padding: 12px 5px;
    margin-top: 0px;
    border-radius: 5px 5px 0px 0px;
    box-shadow: ${(props) => '0px 1px 4px ' + props.theme.colours.borderColour};
    grid-template-rows: 40px;
    grid-template-columns: 30px 200px auto;
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
    width: 140px;
`

export const SortSelect = styled(Select)`
    caret-color: transparent;
    padding: 0px 2px;
    display: flex;
    flex-direction: column;
    top: 1px;
    right: 30px;
    position: absolute;
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
    margin: 0px;
    margin-bottom: 10px;
    padding: 0px;
    width: 100%;
    border-radius: 5px;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
`
