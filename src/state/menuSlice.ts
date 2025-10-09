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

// Function to create a menu
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
      data.image[0] as File
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
        isApproved: false,
      }
    );

    return createdDocument as IMenuItemFetched;
  } catch (error) {
    toast.error(
      `Failed to create menu item: ${
        error instanceof Error ? error.message : "Failed to load restaurant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load restaurant"
    );
  }
});

// Function to list menus
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
      [Query.orderDesc("$createdAt")]
    );
    return response.documents as IMenuItemFetched[];
  } catch (error) {
    toast.error(
      `Failed to fetch restaurants: ${
        error instanceof Error ? error.message : "Failed to load restaurant"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to load restaurant"
    );
  }
});

// Function to update a menu item
export const updateAsyncMenuItem = createAsyncThunk<
  IMenuItemFetched,
  { itemId: string; data: Partial<MenuItemFormData>; newImage?: File | null },
  { rejectValue: string }
>("menuItem/updateMenuItem", async ({ itemId, data, newImage }, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId, menuBucketId } = validateEnv();
    let updateData = { ...data };

    if (newImage) {
      // Upload new image
      const imageFile = await storage.createFile(
        menuBucketId,
        ID.unique(),
        newImage
      );
      updateData.image = imageFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      menuItemsCollectionId,
      itemId,
      updateData
    );

    return updatedDocument as IMenuItemFetched;
  } catch (error) {
    toast.error(
      `Failed to update menu item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// Function to delete a menu item
export const deleteAsyncMenuItem = createAsyncThunk<
  string,
  { itemId: string; imageId: string },
  { rejectValue: string }
>("menuItem/deleteMenuItem", async ({ itemId, imageId }, { rejectWithValue }) => {
  try {
    const { databaseId, menuItemsCollectionId, menuBucketId } = validateEnv();

    // Delete image if exists
    if (imageId) {
      await storage.deleteFile(menuBucketId, imageId);
    }

    // Delete document
    await databases.deleteDocument(databaseId, menuItemsCollectionId, itemId);

    return itemId;
  } catch (error) {
    toast.error(
      `Failed to delete menu item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
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
      )
      // Update
      .addCase(updateAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<IMenuItemFetched>) => {
          state.loading = "succeeded";
          const index = state.menuItems.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.menuItems[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update menu item";
        }
      )
      // Delete
      .addCase(deleteAsyncMenuItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncMenuItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.menuItems = state.menuItems.filter((item) => item.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncMenuItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete menu item";
        }
      );
  },
});

export default menuSlice.reducer;