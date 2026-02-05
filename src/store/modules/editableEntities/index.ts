import { combineReducers } from "redux";
import { editableObject } from "./editableObject";
import { editableUser } from "./editableUser";
import { editableCity } from "./editableCity";
import { editableProject } from "./editableProject";
import { editableWork } from "./editableWork";
import { editableShiftReport } from "./editableShiftReport";
import { editableMaterial } from "./editableMaterial";

export const editableEntities = combineReducers({
  editableProject,
  editableObject,
  editableUser,
  editableCity,
  editableWork,
  editableMaterial,
  editableShiftReport,
});
