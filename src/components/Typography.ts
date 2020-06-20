import styled from 'styled-components'

export const Title = styled.h1`
    font-size: ${(props) => props.theme.fontSizes.xlarge};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.primaryColour};
    padding-top: 20px;
    display: flex;
    align-items: center;
`

export const Header = styled.h2`
    font-size: ${(props) => props.theme.fontSizes.large};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) => props.theme.colours.primaryColour};
    padding-top: 15px;
    margin: 10px 0px;
`

interface Header1Props {
    invert?: boolean
}
export const Header1 = styled.h2<Header1Props>`
    font-size: ${(props) => props.theme.fontSizes.regular};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) =>
        props.invert ? props.theme.colours.altTextColour : props.theme.colours.textColour};
    padding-top: 8px;
    margin: 8px 5px;
`

interface Header2Props {
    invert?: boolean
}
export const Header2 = styled.h2<Header2Props>`
    font-size: ${(props) => props.theme.fontSizes.regular};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) =>
        props.invert ? props.theme.colours.altTextColour : props.theme.colours.textColour};
    padding-top: 0px;
    margin: 0px 5px 5px 5px;
`
interface Header3Props {
    invert?: boolean
}
export const Header3 = styled.h3<Header3Props>`
    font-size: ${(props) => props.theme.fontSizes.small};
    font-weight: ${(props) => props.theme.fontWeights.regular};
    color: ${(props) =>
        props.invert ? props.theme.colours.altTextColour : props.theme.colours.textColour};
    padding-top: 0px;
    margin: 0px 5px 5px 5px;
`

interface ParagraphProps {
    invert?: boolean
}
export const Paragraph = styled.p<ParagraphProps>`
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    font-family: ${(props) => props.theme.font.sansSerif};
    color: ${(props) =>
        props.invert ? props.theme.colours.altTextColour : props.theme.colours.textColour};
    margin: 2px 5px;
    margin: 2px 2px;
`
