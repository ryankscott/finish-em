import { Uuid } from "@typed/uuid";
export const CREATE_PROJECT = "CREATE_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const UPDATE_PROJECT_DESCRIPTION = "UPDATE_PROJECT_DESCRIPTION";
export const UPDATE_PROJECT_NAME = "UPDATE_PROJECT_NAME";

export interface CreateProjectAction {
  type: typeof CREATE_PROJECT;
  id: Uuid;
  name: string;
  description: string;
}
export function createProject(id: Uuid, name: string, description: string) {
  return {
    type: CREATE_PROJECT,
    id: id,
    name: name,
    description: description
  };
}

export interface DeleteProjectAction {
  type: typeof DELETE_PROJECT;
  id: Uuid;
}
export function deleteProject(id: Uuid) {
  return {
    type: DELETE_PROJECT,
    id: id
  };
}
export interface UpdateProjectDescriptionAction {
  type: typeof UPDATE_PROJECT_DESCRIPTION;
  id: Uuid;
  description: string;
}
export function updateProjectDescription(id: Uuid, description: string) {
  return {
    type: UPDATE_PROJECT_DESCRIPTION,
    id: id,
    description: description
  };
}
export interface UpdateProjectNameAction {
  type: typeof UPDATE_PROJECT_NAME;
  id: Uuid;
  name: string;
}
export function updateProjectName(id: Uuid, name: string) {
  return {
    type: UPDATE_PROJECT_NAME,
    id: id,
    name: name
  };
}

export type ProjectActions =
  | CreateProjectAction
  | DeleteProjectAction
  | UpdateProjectDescriptionAction
  | UpdateProjectNameAction;
