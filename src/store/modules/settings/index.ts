import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { objectsSettings } from "./objects";
import { usersSettings } from "./users";
import { citiesSettings } from "./cities";
import { generalSettings } from "./general";
import { projectsSettings } from "./projects";
import { worksSettings } from "./works";
import { shiftReportsSettings } from "./shift-reports";
import { leavesSettings } from "./leaves";
import { projectWorksSettings } from "./projectWorks";
import { objectProjectsSettings } from "./objectProjects";
import { materialsSettings } from "./materials";

const settingsReducer = combineReducers({
  objectsSettings,
  projectsSettings,
  citiesSettings,
  usersSettings,
  generalSettings,
  worksSettings,
  materialsSettings,
  shiftReportsSettings,
  leavesSettings,
  projectWorksSettings,
  objectProjectsSettings,
});

export const settings = persistReducer(
  {
    key: "list-settings",
    storage,
    whitelist: [
      "objectsSettings",
      "projectsSettings",
      "citiesSettings",
      "usersSettings",
      "worksSettings",
      "materialsSettings",
      "shiftReportsSettings",
      "leavesSettings",
      "projectWorksSettings",
      "objectProjectsSettings",
    ],
  },
  settingsReducer,
);
