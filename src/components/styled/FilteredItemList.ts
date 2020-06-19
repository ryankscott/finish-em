import Select from 'react-select'
import styled from 'styled-components'
import Button from '../Button'
import { Header1, Paragraph } from '../Typography'

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
    grid-template-columns: repeat(10, 1fr);
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
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: 30px repeat(9, 1fr);
    grid-template-areas:
        'hide header edit . . . . . . .'
        'hide count  . . . . . . . .';
    width: 100%;
`
export const EditButtonContainer = styled.div`
    position: relative;
    grid-area: edit !important;
    display: flex;
    justify-content: flex-start;
`
export const HideButtonContainer = styled.div`
    grid-area: hide !important;
`
export const ListHeader = styled(Header1)`
    grid-area: header;
    padding: 2px 0px;
    margin: 0px;
`
export const ListCount = styled(Paragraph)`
    grid-area: count;
    padding: 2px 0px;
    margin: 0px;
`

export const Container = styled.div`
    position: relative;
    margin: 10px 0px;
    width: 100%;
`
export const DialogContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    padding: 2px;
    margin: 2px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    border: 1px solid;
    border-color: ${(props) => props.theme.colours.borderColour};
    border-radius: 5px;
    min-width: 160px;
    padding: 5px 5px;
    z-index: 2;
    left: 0px;
    top: 25px;
`
export const DialogHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`
export const DialogName = styled(Paragraph)`
    font-size: ${(props) => props.theme.fontSizes['regular']};
    font-weight: ${(props) => props.theme.fontWeights['regular']};
    padding: 5px 5px;
`

export const Setting = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    padding: 2px 5px;
    width: 100%;
    height: 30px;
    align-items: bottom;
`
export const SettingLabel = styled(Paragraph)`
    color: ${(props) => props.theme.colours.textColour};
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    width: 100px;
`
