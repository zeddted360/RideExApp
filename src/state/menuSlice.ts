import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID } from "appwrite";
import {  MenuItemFormData } from "@/utils/schema";
import { IMenuItemFetched } from "../../types/types";
import toast from "react-hot-toast";

interface IMenuItemProp {
  menuItems: IMenuItemFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IMenuItemProp = {
  menuItems: [],
  loading: "idle",
  error: null,
};

const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};

export const createAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  MenuItemFormData,
  { rejectValue: string }
>("menuItem/createMenuItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, menuBucketId, menuItemsCollectionId } =
      validateEnv();
    if (!data.image?.[0]) throw new Error("Menu item image is required");

    const imageFile = await storage.createFile(
      menuBucketId,
      ID.unique(),
      data.image[0]
    );
    const createdDocument = await databases.createDocument(
      databaseId,
      menuItemsCollectionId,
      ID.unique(),
      {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: imageFile.$id,
        rating: data.rating,
        cookTime: data.cookTime,
        category: data.category,
        restaurantId: data.restaurantId,
        createdAt: new Date().toISOString(),
      }
    );

    return createdDocument as IMenuItemFetched;
  } catch (error) {
    const errorMessage = formatErrorMessage(error);
    toast.error(`Failed to create menu item: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

export const menuSlice = createSlice({
  name: "menuItem",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetMenuItemState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched>) => {
          state.loading = "succeeded";
          state.menuItems = [...state.menuItems, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create menu item";
        }
      );
  },
});

export const { resetError, resetMenuItemState } = menuSlice.actions;

export const selectMenuItems = (state: { menuItem: IMenuItemProp }) =>
  state.menuItem.menuItems;
export const selectMenuItemLoading = (state: { menuItem: IMenuItemProp }) =>
  state.menuItem.loading;
export const selectMenuItemError = (state: { menuItem: IMenuItemProp }) =>
  state.menuItem.error;

export default menuSlice.reducer;
