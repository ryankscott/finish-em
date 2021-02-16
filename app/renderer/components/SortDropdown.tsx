import React, { ReactElement, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import Button from './Button'
import { SortContainer, SortSelect } from './styled/SortDropdown'
import { components } from 'react-select'
import { Icons } from '../assets/icons'
import { orderBy } from 'lodash'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import { Item as ItemType } from '../../main/generated/typescript-helpers'
import RRule from 'rrule'

const GET_THEME = gql`
  query {
    theme @client
  }
`
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
      orderBy(items, [(i) => new Date(i.dueAt)], direction),
  },
  SCHEDULED: {
    label: 'Scheduled',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => new Date(i.scheduledAt)], direction),
  },
  LABEL: {
    label: 'Label',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => i.label?.key], direction),
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
  PROJECT: {
    label: 'Project',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => i.project?.name], direction),
  },
  REPEAT: {
    label: 'Repeat',
    sort: (items: ItemType[], direction: SortDirectionEnum): ItemType[] =>
      orderBy(items, [(i) => (i.repeat ? RRule.fromString(i.repeat).options.freq : -1)], direction),
  },
}

type SortDropdownProps = {
  sortDirection: SortDirectionEnum
  onSetSortType: (type: SortOption) => void
  onSetSortDirection: (direction: SortDirectionEnum) => void
}

function SortDropdown(props: SortDropdownProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
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
            fontSize: 'xsmall',
            theme: theme,
            showDropdownIndicator: true,
            minWidth: '100px',
          })}
          onChange={(e) => {
            props.onSetSortType(e.value)
          }}
        />
        <Button
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
          tooltipText="Toggle sort direction"
        />
      </SortContainer>
    </ThemeProvider>
  )
}

export default SortDropdown
