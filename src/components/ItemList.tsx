import React from "react";
import Item from "./Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { getItemById } from "../utils";
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
          const isSubtask = item.parentId != null;
          if (!props.showSubtasks && isSubtask) return;
          return (
            <div key={"container-" + item.id}>
              <Item
                {...item}
                key={item.id}
                noIndentation={props.noIndentation}
                showProject={props.showProject}
                keymap={itemKeymap}
              />
              {item.children &&
                item.children.map(c => {
                  const childItem = getItemById(c, props.items);
                  // Fometimes the child item has been filtered out, so we don't want to render an empty container
                  if (!childItem) return;
                  return (
                    <Item
                      {...childItem}
                      key={c}
                      noIndentation={props.noIndentation}
                      showProject={props.showProject}
                      keymap={itemKeymap}
                    />
                  );
                })}
            </div>
          );
        })}
        {props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
    </ThemeProvider>
  );
};

export default ItemList;
