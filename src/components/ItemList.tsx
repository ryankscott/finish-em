import React, { ReactElement } from 'react'
import Item, { ItemIcons } from './Item'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { item as itemKeymap } from '../keymap'
import { ItemType, RenderingStrategy } from '../interfaces'
import { Container, NoItemText } from './styled/ItemList'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}

interface OwnProps {
    items: ItemType[]
    renderingStrategy?: RenderingStrategy
    hideIcons: ItemIcons[]
    theme: string
}

type ItemListProps = OwnProps & StateProps
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
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                {props.items.map((o, index) => {
                    if (o == undefined) return
                    switch (props.renderingStrategy) {
                        case RenderingStrategy.All:
                            if (o.parentId != null) {
                                const parentExists = props.items.filter(
                                    (i) => i.id == o.parentId,
                                )
                                if (parentExists.length > 0) {
                                    return
                                } else {
                                    return (
                                        <div key={'container-' + o.id}>
                                            <Item
                                                {...o}
                                                key={o.id}
                                                noIndentOnSubtasks={true}
                                                hideIcons={props.hideIcons}
                                                keymap={itemKeymap}
                                            />
                                        </div>
                                    )
                                }
                            }
                            return (
                                <div key={'container-' + o.id}>
                                    <Item
                                        {...o}
                                        key={o.id}
                                        noIndentOnSubtasks={false}
                                        hideIcons={props.hideIcons}
                                        keymap={itemKeymap}
                                    />
                                </div>
                            )

                        default:
                            if (o.parentId != null) return
                            return (
                                <div key={'container-' + o.id}>
                                    <Item
                                        {...o}
                                        key={o.id}
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

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ItemList)
