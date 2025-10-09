import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { PopularItemFormData } from "@/utils/schema";
import { IPopularItemFetched } from "../../types/types";
import toast from "react-hot-toast";

interface IPopularItemProp {
  popularItems: IPopularItemFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IPopularItemProp = {
  popularItems: [],
  loading: "idle",
  error: null,
};

export const createAsyncPopularItem = createAsyncThunk<
  IPopularItemFetched,
  PopularItemFormData,
  { rejectValue: string }
>("popularItem/createPopularItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, popularBucketId, popularItemsCollectionId } = validateEnv();
    if (!data.image?.[0]) throw new Error("Popular item image is required");

    const imageFile = await storage.createFile(
      popularBucketId,
      ID.unique(),
      data.image[0] as File
    );
    const createdDocument = await databases.createDocument(
      databaseId,
      popularItemsCollectionId,
      ID.unique(),
      {
        name: data.name,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        image: imageFile.$id,
        rating: data.rating,
        reviewCount: data.reviewCount,
        category: data.category,
        cookingTime: data.cookingTime,
        isPopular: data.isPopular,
        discount: data.discount,
        restaurantId: data.restaurantId,
        isApproved: false, 
      }
    );
    return createdDocument as IPopularItemFetched;
  } catch (error) {
    toast.error(
      `Failed to create popular item: ${
        error instanceof Error ? error.message : "Failed to create popular item"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to create popular item"
    );
  }
});

export const listAsyncPopularItems = createAsyncThunk<
  IPopularItemFetched[],
  void,
  { rejectValue: string }
>("popularItem/listPopularItems", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, popularItemsCollectionId } = validateEnv();
    const response = await databases.listDocuments(
      databaseId,
      popularItemsCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents as IPopularItemFetched[];
  } catch (error) {
    toast.error(
      `Failed to fetch popular items: ${
        error instanceof Error ? error.message : "Failed to fetch popular items"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Failed to fetch popular items"
    );
  }
});

// Function to update a popular item
export const updateAsyncPopularItem = createAsyncThunk<
  IPopularItemFetched,
  { itemId: string; data: Partial<PopularItemFormData>; newImage?: File | null },
  { rejectValue: string }
>("popularItem/updatePopularItem", async ({ itemId, data, newImage }, { rejectWithValue }) => {
  try {
    const { databaseId, popularItemsCollectionId, popularBucketId } = validateEnv();

    let updateData = { ...data };

    if (newImage) {
      // Upload new image
      const imageFile = await storage.createFile(
        popularBucketId,
        ID.unique(),
        newImage
      );
      updateData.image = imageFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      popularItemsCollectionId,
      itemId,
      updateData
    );

    return updatedDocument as IPopularItemFetched;
  } catch (error) {
    toast.error(
      `Failed to update popular item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// Function to delete a popular item
export const deleteAsyncPopularItem = createAsyncThunk<
  string,
  { itemId: string; imageId: string },
  { rejectValue: string }
>("popularItem/deletePopularItem", async ({ itemId, imageId }, { rejectWithValue }) => {
  try {
    const { databaseId, popularItemsCollectionId, popularBucketId } = validateEnv();

    // Delete image if exists
    if (imageId) {
      await storage.deleteFile(popularBucketId, imageId);
    }

    // Delete document
    await databases.deleteDocument(databaseId, popularItemsCollectionId, itemId);

    return itemId;
  } catch (error) {
    toast.error(
      `Failed to delete popular item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

export const popularSlice = createSlice({
  name: "popularItem",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAsyncPopularItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncPopularItem.fulfilled,
        (state, action: PayloadAction<IPopularItemFetched>) => {
          state.loading = "succeeded";
          state.popularItems = [...state.popularItems, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncPopularItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create popular item";
        }
      )
      .addCase(listAsyncPopularItems.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncPopularItems.fulfilled,
        (state, action: PayloadAction<IPopularItemFetched[]>) => {
          state.loading = "succeeded";
          state.popularItems = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncPopularItems.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch popular items";
        }
      )
      // Update
      .addCase(updateAsyncPopularItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncPopularItem.fulfilled,
        (state, action: PayloadAction<IPopularItemFetched>) => {
          state.loading = "succeeded";
          const index = state.popularItems.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.popularItems[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncPopularItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update popular item";
        }
      )
      // Delete
      .addCase(deleteAsyncPopularItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncPopularItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.popularItems = state.popularItems.filter((item) => item.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncPopularItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete popular item";
        }
      );
  },
});

export default popularSlice.reducer;