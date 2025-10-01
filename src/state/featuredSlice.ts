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
      data.image[0]
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
        createdAt: new Date().toISOString(),
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
      [Query.orderDesc("createdAt")]
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
      );
  },
});

export default featuredItemSlice.reducer;
