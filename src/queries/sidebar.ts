import { gql } from "@apollo/client";
import { Area, View, Project } from "../resolvers-types";

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
    projects {
      key
      name
      emoji
      deleted
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
