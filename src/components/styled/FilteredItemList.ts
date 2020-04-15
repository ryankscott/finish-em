import Select from 'react-select'
import styled from 'styled-components'

export const HeaderBar = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
`

export const ItemListContainer = styled.div`
    width: 100%;
    display: flex;
    transition: 0.2s ease-in-out;
`

export const FilterBar = styled.div`
    display: grid;
    align-content: flex-end;
    grid-template-columns: 30px 30px repeat(8, 1fr);
    grid-template-areas: 'delete hide . . . . .  sort sort sort';
    width: 100%;
    height: 40px;
    transition: 0.2s ease-in-out;
`
export const SortIcon = styled.div`
    padding-right: 35px;
`

export const SortContainer = styled.div`
    display: flex;
    justify-content: center;
    grid-area: sort;
    position: relative;
    width: 100%;
    transition: 0.2s ease-in-out;
`

export const SortSelect = styled(Select)`
    width: 123px;
    caret-color: transparent;
    padding: 0px 2px;
    position: absolute;
    display: 'flex';
    flex-direction: column;
    top: -11px;
    right: 0px;
`

export const DeleteContainer = styled.div`
    grid-area: delete;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-content: flex-end;
    align-self: flex-end;
    align-items: flex-end;
`

// NOTE: This is hear due to the fact that the sort select is absolutely positions
// If I remove this element from the DOM it position goes whack
interface CompletedContainerProps {
    visible: boolean
}
export const CompletedContainer = styled.div<CompletedContainerProps>`
    grid-area: hide;
    display: flex;
    height: 100%;
    opacity: ${(props) => (props.visible ? 1 : 0)};
    flex-direction: row;
    justify-content: flex-start;
    margin: 0px 2px;
    align-items: flex-end;
`

export const ListName = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    grid-area: name;
`

export const Container = styled.div`
    margin: 10px 0px;
`
