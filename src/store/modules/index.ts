import { combineReducers } from "redux";
import { auth } from "./auth";
import { dictionaries } from "./dictionaries";
import { settings } from "./settings";
import { editableEntities } from "./editableEntities";

export const rootReducer = combineReducers({
  dictionaries,
  auth,
  settings,
  editableEntities,
});

export type IState = ReturnType<typeof rootReducer>;
