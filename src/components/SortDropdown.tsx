import React, { ReactElement, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import Button from './Button'
import { connect } from 'react-redux'
import Tooltip from './Tooltip'
import { SortContainer, SortSelect } from './styled/SortDropdown'
import { components } from 'react-select'
import { Icons } from '../assets/icons'
import { orderBy } from 'lodash'

const DropdownIndicator = (props): ReactElement => {
  return (
    <components.DropdownIndicator {...props}>{Icons['collapse']()}</components.DropdownIndicator>
  )
}

export enum SortDirectionEnum {
  Ascending = 'asc',
  Descending = 'desc',
}

export type SortOption = {
  label: string
  sort: (items: ItemType[], direction: SortDirectionEnum) => ItemType[]
}
type SortOptions = { [key: string]: SortOption }

export const sortOptions: SortOptions = {
  STATUS: {
    label: 'Status',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => i.completed], direction),
  },
  DUE: {
    label: 'Due',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => new Date(i.dueDate)], direction),
  },
  SCHEDULED: {
    label: 'Scheduled',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => new Date(i.scheduledDate)], direction),
  },
  LABEL: {
    label: 'Label',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => i.labelId], direction),
  },
  CREATED: {
    label: 'Created',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => new Date(i.createdAt)], direction),
  },
  UPDATED: {
    label: 'Updated',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => new Date(i.lastUpdatedAt)], direction),
  },
}

interface OwnProps {
  sortDirection: SortDirectionEnum
  onSetSortType: (type: SortOption) => void
  onSetSortDirection: (direction: SortDirectionEnum) => void
}

interface StateProps {
  theme: string
}

type SortDropdownProps = OwnProps & StateProps

function SortDropdown(props: SortDropdownProps): ReactElement {
  return (
    <ThemeProvider theme={themes[props.theme]}>
      <SortContainer>
        <SortSelect
          options={Object.keys(sortOptions).map((s) => ({
            label: sortOptions[s].label,
            value: sortOptions[s],
          }))}
          defaultValue={sortOptions.DUE}
          autoFocus={false}
          placeholder="Sort by:"
          components={{ DropdownIndicator }}
          defaultIsOpen={true}
          styles={selectStyles({
            fontSize: 'xxsmall',
            theme: themes[props.theme],
            showDropdownIndicator: true,
            minWidth: '100px',
          })}
          onChange={(e) => {
            props.onSetSortType(e.value)
          }}
        />
        <Button
          dataFor={'sort-direction-button'}
          type="default"
          spacing="compact"
          iconSize="18px"
          translateZ={props.sortDirection == SortDirectionEnum.Ascending ? 1 : 0}
          icon={'sort'}
          onClick={() => {
            props.sortDirection == SortDirectionEnum.Ascending
              ? props.onSetSortDirection(SortDirectionEnum.Descending)
              : props.onSetSortDirection(SortDirectionEnum.Ascending)
          }}
        />
        <Tooltip id="sort-direction-button" text={'Toggle sort direction'} />
      </SortContainer>
    </ThemeProvider>
  )
}

const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(SortDropdown)
