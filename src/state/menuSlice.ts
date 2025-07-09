import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { MenuItemFormData } from "@/utils/schema";
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

// fuction to create a menu

export const createAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  MenuItemFormData,
  { rejectValue: string }
>("menuItem/createMenuItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, menuBucketId, menuItemsCollectionId } = validateEnv();
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
    toast.error(
      `Failed to create menu item: ${
        error instanceof Error ? error.message : "Failed to load resturant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load resturant"
    );
  }
});

// function to list menus

export const listAsyncMenusItem = createAsyncThunk<
  IMenuItemFetched[],
  void,
  { rejectValue: string }
>("menuItem/listMenuItem", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId } = validateEnv();

    // Fetch all restaurant documents
    const response = await databases.listDocuments(
      databaseId,
      menuItemsCollectionId,
      [Query.orderDesc("createdAt")]
    );
    return response.documents as IMenuItemFetched[];
  } catch (error) {
    toast.error(
      `Failed to fetch restaurants: ${
        error instanceof Error ? error.message : "Failed to load resturant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load resturant"
    );
  }
});

export const menuSlice = createSlice({
  name: "menuItem",
  initialState,
  reducers: {},
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
      )
      // handle list menuItems Case
      .addCase(listAsyncMenusItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncMenusItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched[]>) => {
          state.loading = "succeeded";
          state.menuItems = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncMenusItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch menu items";
        }
      );
  },
});


export default menuSlice.reducer;
