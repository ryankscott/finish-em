import Select from "react-select";
import styled from "styled-components";
import { Paragraph } from "../Typography";

export const HeaderBar = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

interface ItemListContainerProps {
    visible: boolean;
}
export const ItemListContainer = styled.div<ItemListContainerProps>`
  width: 100%;
  display: flex;
  opacity: ${props => (props.visible ? 1 : 0)};
  height: ${props => (props.visible ? "100%" : "0px")};
  transition: 0.2s ease-in-out;
`;

interface FilterBarProps {
    visible: boolean;
}
export const FilterBar = styled.div<FilterBarProps>`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-areas: "hide hide hide . . . . sort sort sort";
  width: 100%;
  opacity: ${props => (props.visible ? 1 : 0)};
  height: ${props => (props.visible ? "40px" : "0px")};
  transition: 0.2s ease-in-out;
  align-content: flex-end;
`;

interface SortContainerProps {
    visible: boolean;
}

export const SortContainer = styled.div<SortContainerProps>`
  display: ${props => (props.visible ? "flex" : "none")};
  justify-content: flex-end;
  grid-area: sort;
  position: relative;
  width: 100%;
  height: 100%;
`;
interface SortSelectProps {
    visible: boolean;
}
export const SortSelect = styled(Select) <SortSelectProps>`
  width: 110px;
  caret-color: transparent;
  padding: 0px 2px;
  position: absolute;
  display: ${props => (props.visible ? "flex" : "none")};
  flex-direction: column;
  top: -12px;
`;

interface CompletedContainerProps {
    visible: boolean;
}
export const CompletedContainer = styled.div<CompletedContainerProps>`
  grid-area: hide;
  display: flex;
  opacity: ${props => (props.visible ? 1 : 0)};
  flex-direction: row;
  justify-content: flex-start;
  margin: 0px 2px;
  cursor: pointer;
`;

export const CompletedText = styled(Paragraph)`
  text-decoration: pointer;
`;

export const ListName = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  grid-area: name;
  cursor: pointer;
`;

export const Container = styled.div`
  margin: 10px 0px;
`;