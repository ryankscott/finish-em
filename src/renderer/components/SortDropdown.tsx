import { ReactElement } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  Button as CButton,
  Flex,
  MenuOptionGroup,
  MenuItemOption,
  MenuDivider,
} from '@chakra-ui/react';
import { Icons } from '../assets/icons';
import { orderBy } from 'lodash';
import { Item as ItemType } from '../../main/generated/typescript-helpers';
import RRule from 'rrule';

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

function SortDropdown(props: SortDropdownProps): ReactElement {
  const generateIconSize = (size: string | undefined) => {
    switch (size) {
      case 'md':
        return '12px';
      case 'sm':
        return '10px';
      case 'xs':
        return '8px';
      default:
        return '12px';
    }
  };
  const iconSize = generateIconSize(props.size);
  return (
    <Flex alignItems={'center'}>
      <Menu
        placement="bottom"
        gutter={0}
        arrowPadding={0}
        closeOnSelect={true}
        closeOnBlur={true}
      >
        <MenuButton
          mx={1}
          size={props.size ? props.size : 'md'}
          as={CButton}
          rightIcon={Icons['collapse'](iconSize, iconSize)}
          fontWeight={'normal'}
          borderRadius={5}
          variant={'default'}
          width={'100%'}
          textAlign={'start'}
        >
          {props.sortType ? props.sortType.label : props.defaultText}
        </MenuButton>

        <MenuList>
          <MenuOptionGroup defaultValue="asc" title="Order" type="radio">
            <MenuItemOption
              value="asc"
              onClick={() =>
                props.onSetSortDirection(SortDirectionEnum.Ascending)
              }
            >
              Ascending
            </MenuItemOption>
            <MenuItemOption
              value="desc"
              onClick={() =>
                props.onSetSortDirection(SortDirectionEnum.Descending)
              }
            >
              Descending
            </MenuItemOption>
          </MenuOptionGroup>
          <MenuDivider />
          <MenuOptionGroup type="radio" title="Property"></MenuOptionGroup>
          <MenuItemOption
            onClick={() =>
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
              props.onSetSortType({
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
