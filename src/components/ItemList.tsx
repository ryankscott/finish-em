import React from "react";
import Item from "./Item";
import styled, { ThemeProvider } from "styled-components";
import { theme } from "../theme";
import { getItemById } from "../utils";
import { Header1 } from "./Typography";

const NoItemText = styled.p`
  color: ${props => props.theme.colours.disabledTextColour};
  font-family: ${props => props.theme.font.sansSerif};
  font-size: ${props => props.theme.fontSizes.small};
  padding-left: 10px;
`;

const Container = styled.div`
  margin: 10px 0px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;
`;
// TODO: Fix this to have an ItemInterface
interface ItemListProps {
  name: string;
  items: [];
  showSubtasks: boolean;
  noIndentation: boolean;
  showProject: boolean;
}

const ItemList = (props: ItemListProps) => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <HeaderContainer>
          <Header1>{props.name}</Header1>
        </HeaderContainer>

        {props.items.map(item => {
          const isSubtask = item.parentId != null;
          if (!props.showSubtasks && isSubtask) return;
          return (
            <div key={"container-" + item.id}>
              <Item
                {...item}
                key={item.id}
                noIndentation={props.noIndentation}
                showProject={props.showProject}
              />
              {item.children &&
                item.children.map(c => {
                  const childItem = getItemById(c, props.items);
                  return (
                    <Item
                      {...childItem}
                      key={c}
                      noIndentation={props.noIndentation}
                      showProject={props.showProject}
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
