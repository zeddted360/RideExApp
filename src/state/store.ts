"use client"
import { configureStore } from "@reduxjs/toolkit";
import restaurantSlice from "./restaurantSlice";
import menuSlice from "./menuSlice";
import orderSlice from "./orderSlice";

export const store = configureStore({
  reducer: {
    restaurant: restaurantSlice,
    menuItem: menuSlice,
    orders: orderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;