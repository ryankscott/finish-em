import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Grid, GridItem, Text } from '@chakra-ui/react'
import { orderBy } from 'lodash'
import React, { ReactElement, useState } from 'react'
import { Item } from '../../main/generated/typescript-helpers'
import { ItemIcons, ItemType } from '../interfaces/item'
import Button from './Button'
import EditFilteredItemList from './EditFilteredItemList'
import ReorderableItemList from './ReorderableItemList'
import SortDropdown, { SortDirectionEnum, SortOption } from './SortDropdown'

const determineVisibilityRules = (
  isFilterable: boolean,
  showItemList: boolean,
  itemsLength: number,
  completedItemsLength: number,
  showCompletedToggle: boolean,
): {
  showCompletedToggle: boolean
  showFilterBar: boolean
  showDeleteButton: boolean
  showSortButton: boolean
} => {
  return {
    // Show completed toggle if we have a completed item and we want to show the toggle
    showCompletedToggle: completedItemsLength > 0 && showCompletedToggle,
    // Show filter bar if the props isFilterable is set and we have more than one item and we haven't hidden all items
    showFilterBar: isFilterable && itemsLength > 0 && showItemList,
    // Show delete button if we have at least one deleted item
    showDeleteButton: completedItemsLength > 0 && showItemList,
    // Show sort button if we have more than one item and we're not hiding the item list and drag and drop is not enabled
    showSortButton: itemsLength >= 1 && showItemList,
  }
}

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
    }
  }
`

export type FilteredItemListProps = {
  componentKey: string
  isFilterable?: boolean
  hiddenIcons?: ItemIcons[]
  listName?: string
  filter: string
  legacyFilter?: string
  flattenSubtasks?: boolean
  showCompletedToggle?: boolean
  initiallyExpanded?: boolean
  hideDeletedSubtasks?: boolean
  hideCompletedSubtasks?: boolean
  readOnly?: boolean
  editing?: boolean
  setEditing?: (editing: boolean) => void
}

const FilteredItemList = (props: FilteredItemListProps): ReactElement => {
  const [sortType, setSortType] = useState({
    label: 'Due',
    sort: (items: Item[], direction: SortDirectionEnum) =>
      orderBy(items, [(i) => new Date(i.dueAt)], direction),
  })
  const [sortDirection, setSortDirection] = useState(SortDirectionEnum.Ascending)
  const [showCompleted, setShowCompleted] = useState(true)
  const [showItemList, setShowItemList] = useState(true)
  const [itemsLength, setItemsLength] = useState([])
  const [expandSubtasks, setExpandSubtasks] = useState(true)
  const [deleteItem] = useMutation(DELETE_ITEM)

  const [allItemsLength, completedItemsLength] = itemsLength
  const visibility = determineVisibilityRules(
    props.isFilterable,
    showItemList,
    allItemsLength,
    completedItemsLength,
    props.showCompletedToggle,
  )

  console.log('re-rendering filtered itemlist')
  // TODO: #338 Handle when items returned is null
  return (
    <Box m={0} p={0} w={'100%'} borderRadius={5} border="1px solid" borderColor="gray.200">
      <Grid
        position={'relative'}
        alignItems={'center'}
        py={4}
        px={2}
        mt={0}
        gridGap={1}
        borderRadius={0}
        borderTopRadius={5}
        gridTemplateRows={'40px'}
        gridTemplateColumns={'30px auto auto'}
        borderBottom={'1px solid'}
        borderColor={'gray.200'}
      >
        <GridItem colSpan={1}>
          <Button
            key={`btn-${props.componentKey}`}
            variant="default"
            size="sm"
            icon={showItemList == true ? 'collapse' : 'expand'}
            onClick={() => {
              setShowItemList(!showItemList)
            }}
            tooltipText="Hide items"
          />
        </GridItem>
        <GridItem colSpan={1}>
          <Flex direction={'row'} py={1} px={0} my={0} mx={2} alignItems={'baseline'}>
            <Text fontSize="lg">{props.listName}</Text>
            <Text fontSize="sm" py={0} px={2} minW={'80px'} color={'gray.500'}>
              {allItemsLength
                ? allItemsLength == 1
                  ? '1 item'
                  : allItemsLength + ' items'
                : '0 items'}
            </Text>
          </Flex>
        </GridItem>
        <GridItem colSpan={1}>
          <Flex
            position={'relative'}
            direction={'row'}
            justifyContent={'flex-end'}
            alignItems={'center'}
          >
            {visibility.showFilterBar && (
              <>
                {visibility.showCompletedToggle && (
                  <Button
                    size="sm"
                    iconSize="14px"
                    variant="default"
                    icon={showCompleted ? 'hide' : 'show'}
                    onClick={() => {
                      setShowCompleted(!showCompleted)
                    }}
                    tooltipText={showCompleted ? 'Show completed items' : 'Hide completed items'}
                  />
                )}
                {visibility.showDeleteButton && (
                  <Button
                    size="sm"
                    iconSize="14px"
                    variant="default"
                    icon="trashSweep"
                    tooltipText="Delete completed items"
                    onClick={() => {
                      /* completedItems.forEach((c) => {
                          if (c.parent?.key == null) {
                            deleteItem({ variables: { key: c.key } })
                          }
                        })*/
                    }}
                  />
                )}
                <Button
                  variant="default"
                  size="sm"
                  icon="expandAll"
                  iconSize="14px"
                  tooltipText={'Expand all subtasks'}
                  onClick={() => {
                    setExpandSubtasks(true)
                  }}
                />
                <Button
                  size="sm"
                  variant="default"
                  icon="collapseAll"
                  iconSize="14px"
                  tooltipText={'Collapse all subtasks'}
                  onClick={() => {
                    setExpandSubtasks(false)
                  }}
                />
                <Box w={'145px'}>
                  <SortDropdown
                    defaultText="Due"
                    sortType={sortType}
                    sortDirection={sortDirection}
                    onSetSortDirection={(d) => {
                      setSortDirection(d)
                    }}
                    onSetSortType={(t) => {
                      setSortType(t)
                    }}
                  />
                </Box>
              </>
            )}
          </Flex>
        </GridItem>
      </Grid>
      {props.editing ? (
        <Box>
          <EditFilteredItemList
            key={`dlg-${props.componentKey}`}
            componentKey={props.componentKey}
            onClose={() => {
              props.setEditing(false)
            }}
          />
        </Box>
      ) : showItemList ? (
        <>
          <Flex w={'100%'} transition={'0.2s ease-in-out'} py={0} px={3}>
            <ReorderableItemList
              expandSubtasks={expandSubtasks}
              onItemsFetched={(itemLengths) => {
                setItemsLength(itemLengths)
              }}
              filter={props.filter}
              key={props.componentKey}
              hideDeletedSubtasks={props.hideDeletedSubtasks}
              hideCompletedSubtasks={props.hideCompletedSubtasks}
              componentKey={props.componentKey}
              hiddenIcons={props.hiddenIcons}
              sortDirection={sortDirection}
              sortType={sortType}
              flattenSubtasks={props.flattenSubtasks}
              showCompleted={showCompleted}
            />
          </Flex>
        </>
      ) : null}
    </Box>
  )
}

export default FilteredItemList
