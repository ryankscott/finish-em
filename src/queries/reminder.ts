import { gql } from '@apollo/client';

export const CREATE_REMINDER = gql`
  mutation CreateReminder(
    $key: String!
    $text: String!
    $remindAt: DateTime
    $itemKey: String
  ) {
    createReminder(
      input: { key: $key, text: $text, remindAt: $remindAt, itemKey: $itemKey }
    ) {
      key
      text
      remindAt
    }
  }
`;

export const DELETE_REMINDER_FROM_ITEM = gql`
  mutation DeleteReminderFromItem($itemKey: String!) {
    deleteReminderFromItem(input: { itemKey: $itemKey }) {
      key
    }
  }
`;
