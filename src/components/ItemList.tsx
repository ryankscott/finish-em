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
  margin: 10px 0px;
`;

interface ItemListProps {
  items: ItemType[];
  showSubtasks: boolean;
  noIndentation: boolean;
  showProject: boolean;
}

// TODO: I've screwed this up because of using interfaces
const ItemList = (props: ItemListProps) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        {props.items.map(item => {
          const isSubtask = item.parentId != null;
          if (!props.showSubtasks && isSubtask) return;
          return (
            <div key={"container-" + item.id}>
              <Item
                key={item.id}
                item={item}
                noIndentation={props.noIndentation}
                showProject={props.showProject}
                keymap={itemKeymap}
              />
              {item.children &&
                item.children.map(c => {
                  const childItem = getItemById(c, props.items);
                  return (
                    <Item
                      item={childItem}
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
