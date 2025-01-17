import { combineReducers } from "redux";
import { objectStatuses } from "./objectStatuses";
import { roles } from "./roles";

export const dictionaries = combineReducers({
  objectStatuses,
  roles,
});
