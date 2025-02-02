import { combineReducers } from "redux";
import { editableObject } from "./editableObject";
import { editableUser } from "./editableUser";
import { editableProject } from "./editableProject";
import { editableWork } from "./editableWork";
import { editableShiftReport } from "./editableShiftReport";

export const editableEntities = combineReducers({
  editableProject,
  editableObject,
  editableUser,
  editableWork,
  editableShiftReport,
});
