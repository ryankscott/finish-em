import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  margin: 0px;
  width: 100%;
  height: 100%;
`;

export const ShortcutIcon = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  :hover {
    cursor: pointer;
  }
`;
interface MainContainerProps {
    sidebarVisible: boolean;
}
export const MainContainer = styled.div<MainContainerProps>`
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  margin-left: ${props => (props.sidebarVisible ? "270px" : "0px")};
  transition: all 0.2s ease-in-out;
  width: 100%;
  align-items: center;
`;