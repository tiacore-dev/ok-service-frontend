import { combineReducers } from "redux";
import { objectsSettings } from "./objects";
import { usersSettings } from "./users";
import { generalSettings } from "./general";

export const settings = combineReducers({
  objectsSettings,
  usersSettings,
  generalSettings,
});
