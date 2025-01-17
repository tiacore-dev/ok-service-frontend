import { combineReducers } from "redux";
import { editableObject } from "./editableObject";
import { editableUser } from "./editableUser";

export const editableEntities = combineReducers({
  editableObject,
  editableUser,
});
