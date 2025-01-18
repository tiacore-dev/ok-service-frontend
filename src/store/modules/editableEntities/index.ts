import { combineReducers } from "redux";
import { editableObject } from "./editableObject";
import { editableUser } from "./editableUser";
import { editableProject } from "./editableProject";

export const editableEntities = combineReducers({
  editableProject,
  editableObject,
  editableUser,
});
