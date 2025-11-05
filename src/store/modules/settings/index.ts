import { combineReducers } from "redux";
import { objectsSettings } from "./objects";
import { usersSettings } from "./users";
import { citiesSettings } from "./cities";
import { generalSettings } from "./general";
import { projectsSettings } from "./projects";
import { worksSettings } from "./works";
import { shiftReportsSettings } from "./shift-reports";
import { leavesSettings } from "./leaves";

export const settings = combineReducers({
  objectsSettings,
  projectsSettings,
  citiesSettings,
  usersSettings,
  generalSettings,
  worksSettings,
  shiftReportsSettings,
  leavesSettings,
});
