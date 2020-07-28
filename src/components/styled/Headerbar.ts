import styled from '../../StyledComponents'
import { transparentize } from 'polished'

export const IconContainer = styled.div`
    grid-area: logo;
    padding: 5px 10px;
`

export const ShortcutIcon = styled.div`
    grid-area: help;
    :hover {
        cursor: pointer;
    }
`
export const FeedbackIcon = styled.div`
    grid-area: feedback;
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
