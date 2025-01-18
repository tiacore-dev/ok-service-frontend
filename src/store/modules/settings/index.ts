import { combineReducers } from "redux";
import { objectsSettings } from "./objects";
import { usersSettings } from "./users";
import { generalSettings } from "./general";
import { projectsSettings } from "./projects";

export const settings = combineReducers({
  objectsSettings,
  projectsSettings,
  usersSettings,
  generalSettings,
});
