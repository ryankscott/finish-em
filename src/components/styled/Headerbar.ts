import styled from '../../StyledComponents'
import { transparentize } from 'polished'

export const Container = styled.div`
    width: 100%;
    display: grid;
    align-items: center;
    grid-template-areas: 'logo name add . search feedback help';
    grid-template-columns: 45px 100px minmax(auto, 400px) auto minmax(200px, auto) 30px 30px;
    grid-template-rows: auto;
    grid-area: header;
    color: ${(props) => props.theme.colours.headerTextColour};
    z-index: 2;
    background-color: ${(props) => props.theme.colours.headerBackgroundColour};
`

export const IconContainer = styled.div`
    grid-area: logo;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px 10px;
`

export const ShortcutIcon = styled.div`
    grid-area: help;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px;
    :hover {
        cursor: pointer;
    }
`
export const FeedbackIcon = styled.div`
    grid-area: feedback;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 5px;
    :hover {
        cursor: pointer;
    }
`

export const NameContainer = styled.div`
    grid-area: name;
    font-size: ${(props) => props.theme.fontSizes.xlarge};
`
export const ItemCreatorContainer = styled.div`
    border-radius: 5px;
    grid-area: add;
    background-color: ${(props) => transparentize(0.4, props.theme.colours.headerBackgroundColour)};
`
export const SelectContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    grid-area: search;
    padding: 0px 10px;
`
