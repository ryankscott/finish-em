export const CREATE_PROJECT = "CREATE_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const UPDATE_PROJECT_DESCRIPTION = "UPDATE_PROJECT_DESCRIPTION";

export function createProject(id, name, description) {
  return {
    type: CREATE_PROJECT,
    id: id,
    name: name,
    description: description
  };
}

export function deleteProject(id) {
  return {
    type: DELETE_PROJECT,
    id: id
  };
}

export function updateProjectDescription(id, description) {
  return {
    type: UPDATE_PROJECT_DESCRIPTION,
    id: id,
    description: description
  };
}
