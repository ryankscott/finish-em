import React, { ReactElement } from 'react'
import Item from './Item'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { connect } from 'react-redux'
import { Uuid } from '@typed/uuid'

export enum RenderingStrategy {
    Default = 'DEFAULT',
    All = 'ALL',
}

interface ItemListProps {
    items: ItemType[]
    order: Uuid[]
    renderingStrategy?: RenderingStrategy
    hideIcons: ItemIcons[]
}

/* We need two strategies for rendering items:

1.  Default 
  - If an item has a parent, don't render it
  - For each item, render the item and it's children  (In the Item component)

 2. All rendering
  - If an item has a parent and the parent is in the list, don't render it
  - If an item has a parent and the parent isn't in the list, render it
*/

function ItemList(props: ItemListProps): ReactElement {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                {props.order.map((o, index) => {
                    const item = props.items.filter((i) => i.id == o)[0]
                    if (item == undefined) return
                    switch (props.renderingStrategy) {
                        case 'ALL':
                            if (item.parentId != null) {
                                const parentExists = props.items.filter(
                                    (i) => i.id == item.parentId,
                                )
                                if (parentExists.length > 0) {
                                    return
                                } else {
                                    return (
                                        <div key={'container-' + item.id}>
                                            <Item
                                                {...item}
                                                key={item.id}
                                                noIndentOnSubtasks={true}
                                                hideIcons={props.hideIcons}
                                                keymap={itemKeymap}
                                            />
                                        </div>
                                    )
                                }
                            }
                            return (
                                <div key={'container-' + item.id}>
                                    <Item
                                        {...item}
                                        key={item.id}
                                        noIndentOnSubtasks={false}
                                        hideIcons={props.hideIcons}
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
                                        hideIcons={props.hideIcons}
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

const mapStateToProps = (state) => ({
    order: state.items.order,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
