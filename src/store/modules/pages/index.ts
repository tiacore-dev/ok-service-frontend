import { combineReducers } from "redux";

import { users } from "./users.state";
import { objects } from "./objects.state";
import { user } from "./user.state";

export const pages = combineReducers({
  objects,
  users,
  user,
});
