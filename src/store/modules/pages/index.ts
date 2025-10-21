import { combineReducers } from "redux";

import { works } from "./works.state";
import { work } from "./work.state";
import { workCategories } from "./work-categories.state";
import { workPrices } from "./work-prices.state";

export const pages = combineReducers({
  works,
  work,
  workCategories,
  workPrices,
  // shiftReportDetails,
});
