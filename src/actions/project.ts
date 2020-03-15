import { Uuid } from "@typed/uuid";
export const CREATE_PROJECT = "CREATE_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const UPDATE_PROJECT_DESCRIPTION = "UPDATE_PROJECT_DESCRIPTION";

export function createProject(id: Uuid, name: string, description: string) {
  return {
    type: CREATE_PROJECT,
    id: id,
    name: name,
    description: description
  };
}

export function deleteProject(id: Uuid) {
  return {
    type: DELETE_PROJECT,
    id: id
  };
}

export function updateProjectDescription(id: Uuid, description: string) {
  return {
    type: UPDATE_PROJECT_DESCRIPTION,
    id: id,
    description: description
  };
}
