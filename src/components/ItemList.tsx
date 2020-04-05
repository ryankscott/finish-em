import React from "react";
import Item from "./Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { item as itemKeymap } from "../keymap";
import { ItemType } from "../interfaces";

const NoItemText = styled.p`
  color: ${props => props.theme.colours.disabledTextColour};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  padding-left: 10px;
`;

const Container = styled.div`
  width: 100%;
  margin: 10px 0px;
`;

interface ItemListProps {
  items: ItemType[];
  showSubtasks: boolean;
  noIndentation: boolean;
  showProject: boolean;
}

const ItemList = (props: ItemListProps) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        {props.items.map(item => {
          if (item == undefined) return;
          // TODO: Work out how to render orphaned items properly
          if (item.parentId != null) return;
          return (
            <div key={"container-" + item.id}>
              <Item
                {...item}
                key={item.id}
                noIndentation={props.noIndentation}
                showProject={props.showProject}
                keymap={itemKeymap}
              />
            </div>
          );
        })}
        {props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
    </ThemeProvider>
  );
};

export default ItemList;
