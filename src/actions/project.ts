import { Uuid, uuid } from "@typed/uuid";
import { CreateProjectDialogProps } from "../components/CreateProjectDialog";
import { UPDATE_ITEM_DESCRIPTION, CREATE_ITEM } from "./item";
export const CREATE_PROJECT = "CREATE_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const UPDATE_PROJECT_DESCRIPTION = "UPDATE_PROJECT_DESCRIPTION";

export interface CreateProjectAction {
  type: typeof CREATE_ITEM;
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
  type: typeof UPDATE_ITEM_DESCRIPTION;
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

export type ProjectActions =
  | CreateProjectAction
  | DeleteProjectAction
  | UpdateProjectDescriptionAction;
