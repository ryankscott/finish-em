import { gql } from '@apollo/client';
import { View, Area, Project } from 'main/generated/typescript-helpers';

export type SidebarData = {
  areas: Area[];
  views: View[];
  projects: Project[];
};
export const GET_SIDEBAR = gql`
  query GetSidebarData {
    areas {
      name
      key
      deleted
      emoji
      sortOrder {
        areaKey
        sortOrder
      }
    }
    views {
      key
      name
      icon
      type
      sortOrder {
        viewKey
        sortOrder
      }
    }
    projects(input: { deleted: false }) {
      key
      name
      emoji
      area {
        key
      }
      sortOrder {
        projectKey
        sortOrder
      }
    }
  }
`;
