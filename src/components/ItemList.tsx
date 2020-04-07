import React from "react";
import Item from "./Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { item as itemKeymap } from "../keymap";
import { ItemType } from "../interfaces";
import { getItemById } from "../utils";

const NoItemText = styled.p`
  color: ${(props) => props.theme.colours.disabledTextColour};
  font-family: ${(props) => props.theme.font.sansSerif};
  font-size: ${(props) => props.theme.fontSizes.small};
  padding-left: 10px;
`;

const Container = styled.div`
  width: 100%;
  margin: 10px 0px;
`;

export enum RenderingStrategy {
  Default = "DEFAULT",
  Orphan = "ORPHAN",
}

interface ItemListProps {
  items: ItemType[];
  showProject: boolean;
  renderingStrategy?: RenderingStrategy;
}

/* We need two strategies for rendering items:

1.  Default
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. Orphan rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
  -  

*/
const ItemList = (props: ItemListProps) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        {props.items.map((item) => {
          if (item == undefined) return;

          switch (props.renderingStrategy) {
            case "DEFAULT":
              if (item.parentId != null) return;
              return (
                <div key={"container-" + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={false}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              );
            case "ORPHAN":
              if (item.parentId != null) {
                const parent = getItemById(item.parentId, props.items);
                if (parent) return null;
              }
              return (
                <div key={"container-" + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={true}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              );
            default:
              if (item.parentId != null) return;
              return (
                <div key={"container-" + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={false}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              );
          }
        })}
        {props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
    </ThemeProvider>
  );
};

export default ItemList;
