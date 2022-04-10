import { ReactiveVar, makeVar, InMemoryCache } from '@apollo/client';

export const sidebarVisibleVar: ReactiveVar<boolean> = makeVar<boolean>(true);
export const focusbarVisibleVar: ReactiveVar<boolean> = makeVar<boolean>(false);
export const shortcutDialogVisibleVar: ReactiveVar<boolean> =
  makeVar<boolean>(false);
export const activeItemVar: ReactiveVar<Array<string>> = makeVar<Array<string>>(
  []
);
export const subtasksVisibleVar: ReactiveVar<{
  [key: string]: { [key: string]: boolean };
}> = makeVar<{ [key: string]: { [key: string]: boolean } }>({});

export const activeCalendarVar: ReactiveVar<Object> = makeVar<Object>({});

export const queryCache = new InMemoryCache({
  typePolicies: {
    Label: {
      keyFields: ['key'],
    },
    Feature: {
      keyFields: ['key'],
    },
    Project: {
      keyFields: ['key'],
    },
    Item: {
      keyFields: ['key'],
    },
    Area: {
      keyFields: ['key'],
    },
    View: {
      keyFields: ['key'],
    },
    Component: {
      keyFields: ['key'],
    },
    Query: {
      fields: {
        sidebarVisible: {
          read() {
            return sidebarVisibleVar();
          },
        },
        focusbarVisible: {
          read() {
            return focusbarVisibleVar();
          },
        },
        shortcutDialogVisible: {
          read() {
            return shortcutDialogVisibleVar();
          },
        },
        activeItem: {
          read() {
            return activeItemVar();
          },
        },
        subtasksVisible: {
          read() {
            return subtasksVisibleVar();
          },
        },
        activeCalendar: {
          read() {
            return activeCalendarVar();
          },
        },
      },
    },
  },
});
