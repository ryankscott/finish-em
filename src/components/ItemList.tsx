import React, { ReactElement } from 'react'
import Item from './Item'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType } from '../interfaces'
import { getItemById } from '../utils'
import { Container, NoItemText } from './styled/ItemList'

export enum RenderingStrategy {
  Default = 'DEFAULT',
  All = 'ALL',
}

interface ItemListProps {
  items: ItemType[]
  showProject: boolean
  renderingStrategy?: RenderingStrategy
}

/* We need two strategies for rendering items:

1.  Default
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
  -  

*/
const ItemList = (props: ItemListProps): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        {props.items.map((item) => {
          if (item == undefined) return

          switch (props.renderingStrategy) {
            case 'DEFAULT':
              if (item.parentId != null) return
              return (
                <div key={'container-' + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={false}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              )
            case 'ALL':
              if (item.parentId != null) {
                const parent = getItemById(item.parentId, props.items)
                if (parent) return null
              }
              return (
                <div key={'container-' + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={true}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              )
            default:
              if (item.parentId != null) return
              return (
                <div key={'container-' + item.id}>
                  <Item
                    {...item}
                    key={item.id}
                    noIndentOnSubtasks={false}
                    showProject={props.showProject}
                    keymap={itemKeymap}
                  />
                </div>
              )
          }
        })}
        {props.items.length == 0 && <NoItemText>No items</NoItemText>}
      </Container>
    </ThemeProvider>
  )
}

export default ItemList
