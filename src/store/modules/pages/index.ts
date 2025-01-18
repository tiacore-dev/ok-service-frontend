import { combineReducers } from "redux";

import { users } from "./users.state";
import { objects } from "./objects.state";
import { user } from "./user.state";
import { object } from "./object.state";

export const pages = combineReducers({
  objects,
  object,
  users,
  user,
});
