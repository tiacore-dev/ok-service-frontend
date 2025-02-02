import { combineReducers } from "redux";
import { objectsSettings } from "./objects";
import { usersSettings } from "./users";
import { generalSettings } from "./general";
import { projectsSettings } from "./projects";
import { worksSettings } from "./works";
import { shiftReportsSettings } from "./shift-reports";

export const settings = combineReducers({
  objectsSettings,
  projectsSettings,
  usersSettings,
  generalSettings,
  worksSettings,
  shiftReportsSettings,
});
