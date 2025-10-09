import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import { FeaturedItemFormData } from "@/utils/schema";
import { IFeaturedItemFetched } from "../../types/types";
import toast from "react-hot-toast";

interface IFeaturedItemProp {
  featuredItems: IFeaturedItemFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: IFeaturedItemProp = {
  featuredItems: [],
  loading: "idle",
  error: null,
};

// Function to create a featured item
export const createAsyncFeaturedItem = createAsyncThunk<
  IFeaturedItemFetched,
  FeaturedItemFormData,
  { rejectValue: string }
>("featuredItem/createFeaturedItem", async (data, { rejectWithValue }) => {
  try {
    const { databaseId, featuredBucketId, featuredId } =
      validateEnv();
    if (!data.image?.[0]) throw new Error("Featured item image is required");

    const imageFile = await storage.createFile(
      featuredBucketId,
      ID.unique(),
      data.image[0] as File
    );
    const createdDocument = await databases.createDocument(
      databaseId,
      featuredId,
      ID.unique(),
      {
        name: data.name,
        price: data.price,
        image: imageFile.$id,
        rating: data.rating,
        restaurant: data.restaurantId,
        description: data.description,
        category: data.category,
        isApproved: false, 
      }
    );

    return createdDocument as IFeaturedItemFetched;
  } catch (error) {
    toast.error(
      `Failed to create featured item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// Function to list featured items
export const listAsyncFeaturedItems = createAsyncThunk<
  IFeaturedItemFetched[],
  void,
  { rejectValue: string }
>("featuredItem/listFeaturedItems", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, featuredId } = validateEnv();

    // Fetch all featured item documents
    const response = await databases.listDocuments(
      databaseId,
      featuredId,
      [Query.orderDesc("$createdAt")]
    );
    return response.documents as IFeaturedItemFetched[];
  } catch (error) {
    toast.error(
      `Failed to fetch featured items: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// Function to update a featured item
export const updateAsyncFeaturedItem = createAsyncThunk<
  IFeaturedItemFetched,
  { itemId: string; data: Partial<FeaturedItemFormData>; newImage?: File | null },
  { rejectValue: string }
>("featuredItem/updateFeaturedItem", async ({ itemId, data, newImage }, { rejectWithValue }) => {
  try {
    const { databaseId, featuredId, featuredBucketId } = validateEnv();

    let updateData = { ...data };


    if (newImage) {
      // Upload new image
      const imageFile = await storage.createFile(
        featuredBucketId,
        ID.unique(),
        newImage
      );
      updateData.image = imageFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      featuredId,
      itemId,
      updateData
    );

    return updatedDocument as IFeaturedItemFetched;
  } catch (error) {
    toast.error(
      `Failed to update featured item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

// Function to delete a featured item
export const deleteAsyncFeaturedItem = createAsyncThunk<
  string,
  { itemId: string; imageId: string },
  { rejectValue: string }
>("featuredItem/deleteFeaturedItem", async ({ itemId, imageId }, { rejectWithValue }) => {
  try {
    const { databaseId, featuredId, featuredBucketId } = validateEnv();

    // Delete image if exists
    if (imageId) {
      await storage.deleteFile(featuredBucketId, imageId);
    }

    // Delete document
    await databases.deleteDocument(databaseId, featuredId, itemId);

    return itemId;
  } catch (error) {
    toast.error(
      `Failed to delete featured item: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    return rejectWithValue(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
});

export const featuredItemSlice = createSlice({
  name: "featuredItem",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createAsyncFeaturedItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncFeaturedItem.fulfilled,
        (state, action: PayloadAction<IFeaturedItemFetched>) => {
          state.loading = "succeeded";
          state.featuredItems = [...state.featuredItems, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncFeaturedItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create featured item";
        }
      )
      // Handle list featured items case
      .addCase(listAsyncFeaturedItems.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncFeaturedItems.fulfilled,
        (state, action: PayloadAction<IFeaturedItemFetched[]>) => {
          state.loading = "succeeded";
          state.featuredItems = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncFeaturedItems.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch featured items";
        }
      )
      // Update
      .addCase(updateAsyncFeaturedItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        updateAsyncFeaturedItem.fulfilled,
        (state, action: PayloadAction<IFeaturedItemFetched>) => {
          state.loading = "succeeded";
          const index = state.featuredItems.findIndex((item) => item.$id === action.payload.$id);
          if (index !== -1) {
            state.featuredItems[index] = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(
        updateAsyncFeaturedItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to update featured item";
        }
      )
      // Delete
      .addCase(deleteAsyncFeaturedItem.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        deleteAsyncFeaturedItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = "succeeded";
          state.featuredItems = state.featuredItems.filter((item) => item.$id !== action.payload);
          state.error = null;
        }
      )
      .addCase(
        deleteAsyncFeaturedItem.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to delete featured item";
        }
      );
  },
});

export default featuredItemSlice.reducer;