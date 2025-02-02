import { combineReducers } from "redux";

import { users } from "./users.state";
import { objects } from "./objects.state";
import { user } from "./user.state";
import { object } from "./object.state";
import { projects } from "./projects.state";
import { project } from "./project.state";
import { works } from "./works.state";
import { work } from "./work.state";
import { workCategories } from "./work-categories.state";
import { shiftReport } from "./shift-report.state";
import { shiftReports } from "./shift-reports.state";
import { workPrices } from "./work-prices.state";

export const pages = combineReducers({
  projects,
  project,
  objects,
  object,
  users,
  user,
  works,
  work,
  workCategories,
  workPrices,
  shiftReport,
  shiftReports,
});
