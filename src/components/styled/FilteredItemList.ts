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
    grid-template-columns: repeat(20, 1fr);
    grid-template-areas: 'delete hide hide . . . . . . . . . . . . sort sort sort sort sort collapse expand';
    width: 100%;
    height: 40px;
    transition: 0.2s ease-in-out;
`
export const SortIcon = styled.div`
    padding-right: 35px;
`

export const SortContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    grid-area: sort;
    position: relative;
    width: 100%;
    transition: 0.2s ease-in-out;
`

export const SortSelect = styled(Select)`
    width: 125px;
    caret-color: transparent;
    padding: 0px 2px;
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 1px;
    right: 30px;
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

export const CollapseContainer = styled.div`
    grid-area: collapse;
`

export const ExpandContainer = styled.div`
    grid-area: expand;
`

export const ListName = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    grid-area: name;
`

export const Container = styled.div`
    margin: 10px 0px;
    width: 100%;
`
