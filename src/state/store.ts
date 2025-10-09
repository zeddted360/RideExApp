"use client"
import { configureStore } from "@reduxjs/toolkit";
import restaurantSlice from "./restaurantSlice";
import menuSlice from "./menuSlice";
import orderSlice from "./orderSlice";
import featuredItemSlice from "./featuredSlice";
import popularSlice from "./popularSlice";
import authSlice from "./authSlice";
import notificationSlice from "./notificationSlice";
import bookedOrdersReducer from "./bookedOrdersSlice";
import discountSlice from "./discountSlice";
import vendorSlice from "./vendorSlice";
import riderSlice from "./riderSlice";


export const store = configureStore({
  reducer: {
    restaurant: restaurantSlice,
    menuItem: menuSlice,
    orders: orderSlice,
    featuredItem: featuredItemSlice,
    popularItem: popularSlice,
    auth: authSlice,
    notifications: notificationSlice,
    bookedOrders: bookedOrdersReducer,
    discounts:discountSlice,
    vendors:vendorSlice,
    riders:riderSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;