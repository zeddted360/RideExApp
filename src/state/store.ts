"use client"
import { configureStore } from "@reduxjs/toolkit";
import restaurantSlice from "./restaurantSlice";
import  menuSlice  from "./menuSlice";


export const store = configureStore({
  reducer: {
    restaurant: restaurantSlice,
    menuItem:menuSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;