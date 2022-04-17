import { ReactElement } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  Button,
  Flex,
  MenuOptionGroup,
  MenuItemOption,
  MenuDivider,
  Icon,
} from '@chakra-ui/react';
import { orderBy } from 'lodash';
import RRule from 'rrule';
import { Icons } from '../assets/icons';
import { Item as ItemType } from '../../main/generated/typescript-helpers';

export enum SortDirectionEnum {
  Ascending = 'asc',
  Descending = 'desc',
}

export type SortOption = {
  label: string;
  sort: (items: ItemType[], direction: SortDirectionEnum) => ItemType[];
};

type SortDropdownProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  defaultText?: string;
  sortType: SortOption;
  sortDirection: SortDirectionEnum;
  onSetSortType: (type: SortOption) => void;
  onSetSortDirection: (direction: SortDirectionEnum) => void;
};

function SortDropdown({
  size,
  defaultText,
  sortType,
  sortDirection,
  onSetSortDirection,
  onSetSortType,
}: SortDropdownProps): ReactElement {
  return (
    <Flex alignItems="center">
      <Menu
        placement="bottom"
        gutter={0}
        arrowPadding={0}
        closeOnSelect
        closeOnBlur
      >
        <MenuButton
          mx={1}
          size={size || 'md'}
          as={Button}
          rightIcon={<Icon as={Icons.collapse} />}
          fontWeight="normal"
          borderRadius="md"
          variant="default"
          width="100%"
          textAlign="start"
        >
          {sortType ? sortType.label : defaultText}
        </MenuButton>

        <MenuList>
          <MenuOptionGroup defaultValue="asc" title="Order" type="radio">
            <MenuItemOption
              value="asc"
              onClick={() => onSetSortDirection(SortDirectionEnum.Ascending)}
            >
              Ascending
            </MenuItemOption>
            <MenuItemOption
              value="desc"
              onClick={() => onSetSortDirection(SortDirectionEnum.Descending)}
            >
              Descending
            </MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup type="radio" title="Property" />
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Status',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => i.completed], direction),
              })
            }
          >
            Status
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Due',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => new Date(i.dueAt)], direction),
              })
            }
          >
            Due
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Scheduled',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => new Date(i.scheduledAt)], direction),
              })
            }
          >
            Scheduled
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Label',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => i.label?.key], direction),
              })
            }
          >
            Label
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Created',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => new Date(i.createdAt)], direction),
              })
            }
          >
            Created
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Updated',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => new Date(i.lastUpdatedAt)], direction),
              })
            }
          >
            Updated
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Project',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(items, [(i) => i.project?.name], direction),
              })
            }
          >
            Project
          </MenuItemOption>
          <MenuItemOption
            onClick={() =>
              onSetSortType({
                label: 'Repeat',
                sort: (
                  items: ItemType[],
                  direction: SortDirectionEnum
                ): ItemType[] =>
                  orderBy(
                    items,
                    [
                      (i) =>
                        i.repeat ? RRule.fromString(i.repeat).options.freq : -1,
                    ],
                    direction
                  ),
              })
            }
          >
            Repeat
          </MenuItemOption>
        </MenuList>
      </Menu>
    </Flex>
  );
}

export default SortDropdown;
