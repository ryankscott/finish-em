import styled from 'styled-components'

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    height: 100vh;
`
export const SubtaskContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 15px 0px;
    margin-top: 30px;
`
export const AttributeContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 2px 10px;
    min-height: 30px;
`
export const AttributeKey = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 65%;
    margin-left: 0px;
`
export const AttributeValue = styled.div`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 35%;
    min-width: 190px;
`

export const TitleContainer = styled.div`
    display: flex;
    flex-direction: row;
    margin: 10px 0px;
    margin-bottom: 20px;
    align-items: center;
`
interface HeaderContainerProps {
    visible: boolean
}
export const HeaderContainer = styled.div<HeaderContainerProps>`
    display: ${(props) => (props.visible ? 'grid' : 'none')};
    grid-template-areas: 'BACK UP . . CLOSE';
    grid-template-columns: repeat(5, 1fr);
    flex-direction: row;
    width: 100%;
    margin-bottom: 10px;
`

export const Project = styled.div`
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 2px;
    padding: 4px 8px;
    font-size: ${(props) => props.theme.fontSizes.xsmall};
    color: ${(props) => props.theme.colours.altTextColour};
    background-color: ${(props) => props.theme.colours.primaryColour};
    border-radius: 5px;
`
