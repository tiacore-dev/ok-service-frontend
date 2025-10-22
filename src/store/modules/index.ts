import { combineReducers } from "redux";
import { auth } from "./auth";
import { settings } from "./settings";
import { editableEntities } from "./editableEntities";

export const rootReducer = combineReducers({
  auth,
  settings,
  editableEntities,
});

export type IState = ReturnType<typeof rootReducer>;
