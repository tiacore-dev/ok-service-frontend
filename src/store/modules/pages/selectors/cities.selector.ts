import { createSelector } from "@reduxjs/toolkit";
import { IState } from "../..";
import { ICity } from "../../../../interfaces/cities/ICity";

export const getCitiesMap = createSelector(
  [(state: IState) => state.pages.cities.data],
  (cities) => {
    const map: Record<string, ICity> = {};
    cities.forEach((city) => {
      map[city.city_id] = city;
    });
    return map;
  },
);

export const getCitiesState = createSelector(
  [(state: IState) => state.pages.cities],
  (cities) => cities,
);
