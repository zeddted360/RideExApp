import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IRestaurantFetched, Restaurant } from "../../types/types";
import { databases, storage, validateEnv } from "@/utils/appwrite";
import { ID, Query } from "appwrite";
import toast from "react-hot-toast";

interface IResProp {
  restaurants: IRestaurantFetched[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

interface InputObject {
  name: string;
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
  logo: FileList;
}

const initialState: IResProp = {
  restaurants: [],
  loading: "idle",
  error: null,
};

// Helper function to format error messages
const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};

// Async thunk for creating restaurant
export const createAsyncRestaurant = createAsyncThunk<
  IRestaurantFetched,
  InputObject,
  { rejectValue: string }
>("restaurant/createRestaurant", async (data, { rejectWithValue }) => {
  try {
    // Validate input data
    if (!data.logo[0]) {
      throw new Error("Restaurant logo is required");
    }

    const { databaseId, restaurantBucketId, restaurantsCollectionId } =
      validateEnv();

    // Upload logo
    const logoFile = await storage.createFile(
      restaurantBucketId,
      ID.unique(),
      data.logo[0]
    );

    // Create restaurant document
    const createdDocument = await databases.createDocument(
      databaseId,
      restaurantsCollectionId,
      ID.unique(),
      {
        name: data.name,
        logo: logoFile.$id,
        rating: data.rating,
        deliveryTime: data.deliveryTime,
        category: data.category,
        distance: data.distance,
        createdAt: new Date().toISOString(),
      }
    );

    toast.success("Restaurant created successfully!");
    return createdDocument as IRestaurantFetched;
  } catch (error) {
    const errorMessage = formatErrorMessage(error);
    toast.error(`Failed to create restaurant: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

// Async thunk for listing restaurants
export const listAsyncRestaurants = createAsyncThunk<
  IRestaurantFetched[],
  void,
  { rejectValue: string }
>("restaurant/listRestaurants", async (_, { rejectWithValue }) => {
  try {
    const { databaseId, restaurantsCollectionId } = validateEnv();

    // Fetch all restaurant documents
    const response = await databases.listDocuments(
      databaseId,
      restaurantsCollectionId,
      [Query.orderDesc("createdAt")] // Optional: Sort by creation date
    );
    return response.documents as IRestaurantFetched[];
  } catch (error) {
    const errorMessage = formatErrorMessage(error);
    toast.error(`Failed to fetch restaurants: ${errorMessage}`);
    return rejectWithValue(errorMessage);
  }
});

// Slice
export const restaurantSlice = createSlice({
  name: "restaurant",
  initialState,
  reducers: {
    // Reset error state
    resetError: (state) => {
      state.error = null;
    },
    // Reset entire state
    resetRestaurantState: () => initialState,
  },
  extraReducers: (builder) => {
    // Handle createAsyncRestaurant
    builder
      .addCase(createAsyncRestaurant.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        createAsyncRestaurant.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched>) => {
          state.loading = "succeeded";
          state.restaurants = [...state.restaurants, action.payload];
          state.error = null;
        }
      )
      .addCase(
        createAsyncRestaurant.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to create restaurant";
        }
      )
      // Handle listAsyncRestaurants
      .addCase(listAsyncRestaurants.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        listAsyncRestaurants.fulfilled,
        (state, action: PayloadAction<IRestaurantFetched[]>) => {
          state.loading = "succeeded";
          state.restaurants = action.payload;
          state.error = null;
        }
      )
      .addCase(
        listAsyncRestaurants.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch restaurants";
        }
      );
  },
});

// Export actions
export const { resetError, resetRestaurantState } = restaurantSlice.actions;

// Selectors
export const selectRestaurants = (state: { restaurant: IResProp }) =>
  state.restaurant.restaurants;
export const selectRestaurantLoading = (state: { restaurant: IResProp }) =>
  state.restaurant.loading;
export const selectRestaurantError = (state: { restaurant: IResProp }) =>
  state.restaurant.error;

export default restaurantSlice.reducer;
