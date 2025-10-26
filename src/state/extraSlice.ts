import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ID, Query } from "appwrite";
import { validateEnv, databases, storage } from "@/utils/appwrite";
import { IExtras, IFetchedExtras } from "../../types/types";

interface ExtraState {
  extras: IFetchedExtras[];
  allExtras: IFetchedExtras[];
  currentExtra: IFetchedExtras | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ExtraState = {
  extras: [],
  allExtras: [],
  currentExtra: null,
  loading: "idle",
  error: null,
};

export const listAsyncExtras = createAsyncThunk<
  IFetchedExtras[],
  string, // vendorId
  { rejectValue: string }
>(
  "extra/listAsyncExtras",
  async (vendorId, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId } = validateEnv();
      const response = await databases.listDocuments<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        [Query.equal("vendorId", vendorId), Query.orderDesc("$createdAt")]
      );
      return response.documents;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch extras"
      );
    }
  }
);

export const listAllAsyncExtras = createAsyncThunk<
  IFetchedExtras[],
  void,
  { rejectValue: string }
>(
  "extra/listAllAsyncExtras",
  async (_, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId } = validateEnv();
      const response = await databases.listDocuments<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        [Query.limit(100), Query.orderDesc("$createdAt")]
      );
      return response.documents;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch all extras"
      );
    }
  }
);

export const fetchExtraById = createAsyncThunk<
  IFetchedExtras,
  string, // extraId
  { rejectValue: string }
>(
  "extra/fetchById",
  async (extraId, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId } = validateEnv();
      const response = await databases.getDocument<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        extraId
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch extra"
      );
    }
  }
);

export const createAsyncExtra = createAsyncThunk<
  IFetchedExtras,
  Omit<IExtras, "image"> & { image?: File },
  { rejectValue: string }
>(
  "extra/createAsyncExtra",
  async (extraData, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId } = validateEnv();
      const checkExistingExtract = await databases.listDocuments(
        databaseId,
        extrasCollectionId,
        [Query.equal("name", extraData.name)]
      );

      if (checkExistingExtract.documents.length > 0) {
        throw new Error("An Extra with same name already exist");
      }

      let imageId: string | undefined;
      if (extraData.image instanceof File) {
        const { extrasBucketId } = validateEnv();
        const file = await storage.createFile(
          extrasBucketId,
          ID.unique(),
          extraData.image
        );
        imageId = file.$id;
      }

      const docData = {
        name: extraData.name,
        price: extraData.price,
        description: extraData.description,
        image: imageId,
        vendorId: extraData.vendorId,
      };

      const response = await databases.createDocument<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        ID.unique(),
        docData
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create extra"
      );
    }
  }
);

export const updateAsyncExtra = createAsyncThunk<
  IFetchedExtras,
  { extraId: string; data: IExtras; newImage?: File },
  { rejectValue: string }
>(
  "extra/updateAsyncExtra",
  async ({ extraId, data, newImage }, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId } = validateEnv();
      let updateData = { ...data };

      // Fetch existing extra to get current image ID if needed
      const existingExtra = await databases.getDocument<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        extraId
      );
      const currentImageId = existingExtra.image;

      if (newImage instanceof File) {
        // If there's an existing image, delete it first
        if (currentImageId) {
          const { extrasBucketId } = validateEnv();
          await storage.deleteFile(extrasBucketId, currentImageId);
        }

        // Upload the new image
        const { extrasBucketId } = validateEnv();
        const file = await storage.createFile(
          extrasBucketId,
          ID.unique(),
          newImage
        );
        updateData.image = file.$id;
      }
      // If no newImage, don't touch the image field (keep existing or null)

      const response = await databases.updateDocument<IFetchedExtras>(
        databaseId,
        extrasCollectionId,
        extraId,
        updateData
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update extra"
      );
    }
  }
);

export const deleteAsyncExtra = createAsyncThunk<
  {},
  { extraId: string; imageId?: string },
  { rejectValue: string }
>(
  "extra/deleteAsyncExtra",
  async ({ extraId, imageId }, { rejectWithValue }) => {
    try {
      const { databaseId, extrasCollectionId, extrasBucketId } = validateEnv();

      if (imageId) {
        await storage.deleteFile(extrasBucketId, imageId);
      }

      const response = await databases.deleteDocument(
        databaseId,
        extrasCollectionId,
        extraId
      );

      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete extra"
      );
    }
  }
);

const extraSlice = createSlice({
  name: "extra",
  initialState,
  reducers: {
    clearCurrentExtra: (state) => {
      state.currentExtra = null;
    },
    setExtras: (state, action: PayloadAction<IFetchedExtras[]>) => {
      state.extras = action.payload;
    },
    setLoading: (state, action: PayloadAction<"idle" | "pending" | "succeeded" | "failed">) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // List
      .addCase(listAsyncExtras.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(listAsyncExtras.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.extras = action.payload;
      })
      .addCase(listAsyncExtras.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // List All
      .addCase(listAllAsyncExtras.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(listAllAsyncExtras.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.allExtras = action.payload;
      })
      .addCase(listAllAsyncExtras.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Fetch by ID
      .addCase(fetchExtraById.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchExtraById.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.currentExtra = action.payload;
      })
      .addCase(fetchExtraById.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Create
      .addCase(createAsyncExtra.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(createAsyncExtra.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.extras.push(action.payload);
      })
      .addCase(createAsyncExtra.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Update
      .addCase(updateAsyncExtra.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(updateAsyncExtra.fulfilled, (state, action) => {
        state.loading = "succeeded";
        const index = state.extras.findIndex((extra) => extra.$id === action.payload.$id);
        if (index !== -1) {
          state.extras[index] = action.payload;
        }
        if (state.currentExtra?.$id === action.payload.$id) {
          state.currentExtra = action.payload;
        }
      })
      .addCase(updateAsyncExtra.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      })
      // Delete
      .addCase(deleteAsyncExtra.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(deleteAsyncExtra.fulfilled, (state, action) => {
        state.loading = "succeeded";
        const { extraId } = action.meta.arg;
        state.extras = state.extras.filter((extra) => extra.$id !== extraId);
        if (state.currentExtra?.$id === extraId) {
          state.currentExtra = null;
        }
      })
      .addCase(deleteAsyncExtra.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentExtra, setExtras, setLoading, setError } = extraSlice.actions;
export default extraSlice.reducer;