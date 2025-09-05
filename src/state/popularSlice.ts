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
      data.image[0]
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
        createdAt: new Date().toISOString(),
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
      [Query.orderDesc("createdAt"),Query.equal("isApproved",true)]
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
      );
  },
});

export default popularSlice.reducer; 