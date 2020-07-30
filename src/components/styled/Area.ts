import styled from 'styled-components'

export const AreaContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 20px 20px;
    padding: 20px 20px;
    margin-top: 50px; /* Note: This is because there's less padding on the editable title */
    width: 100%;
    max-width: 700px;
`

export const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0px;
`

export const StaleContainer = styled.div`
    display: flex;
    flex-direction: row;
    height: 100%;
`

export const ProjectContainer = styled.div`
    position: relative;
    transition: max-height 0.2s ease-in-out, opacity 0.05s ease-in-out;
    max-height: 200px;
    max-width: 650px;
    font-family: ${(props) => props.theme.font.sansSerif};
    font-size: ${(props) => props.theme.fontSizes.regular};
    display: grid;
    margin: 1px 0px;
    grid-template-columns: 40px min(120px) auto;
    grid-auto-rows: auto auto;
    grid-template-areas:
        'donut name description'
        'donut startAt endAt';
    padding: 5px;
    align-items: center;
    cursor: pointer;
    border-radius: 5px;
    background-color: ${(props) => props.theme.colours.backgroundColour};
    :focus {
        background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
    :active {
        background-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }

    &:after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        margin: 0px auto;
        height: 1px;
        width: calc(100% - 10px);
        border-bottom: 1px solid;
        border-color: ${(props) => props.theme.colours.focusBackgroundColour};
    }
`

export const ProjectName = styled.div`
    grid-area: name;
    color: ${(props) => props.theme.colours.textColour};
    font-weight: ${(props) => props.theme.fontWeights.bold};
`
export const ProjectDescription = styled.div`
    grid-area: description;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
`
export const ProjectStartAt = styled.div`
    grid-area: startAt;
    color: ${(props) => props.theme.colours.disabledTextColour};
`
export const ProjectEndAt = styled.div`
    grid-area: endAt;
    color: ${(props) => props.theme.colours.disabledTextColour};
`
