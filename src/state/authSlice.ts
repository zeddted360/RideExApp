import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { account, validateEnv } from "@/utils/appwrite";
import toast from "react-hot-toast";
import { AuthState, IUser } from "../../types/types";

const initialState: AuthState = {
  user: null,
  loading: "idle",
  error: null,
};

// Async thunk to log in user
export const loginAsync = createAsyncThunk<
  IUser,
  { email: string; password: string; rememberMe: boolean },
  { rejectValue: string }
>(
  "auth/login",
  async ({ email, password, rememberMe }, { rejectWithValue }) => {
    try {
      // Set session persistence based on rememberMe
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      // Get phone number from localStorage if available
      let phoneNumber: string | undefined;
      let phoneVerified: boolean | undefined;

      try {
        const phoneData = localStorage.getItem("userPhoneData");
        if (phoneData) {
          const parsed = JSON.parse(phoneData);
          phoneNumber = parsed.phoneNumber;
          phoneVerified = parsed.verified;
        }
      } catch (error) {
        console.warn("Failed to get phone data from localStorage:", error);
      }

      return {
        userId: user.$id,
        username: user.name,
        email: user.email,
        role: user.email === "nwiboazubuike@gmail.com" ? "admin" : "user",
        phoneNumber,
        phoneVerified,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Async thunk to log in as guest
export const loginAsGuestAsync = createAsyncThunk<
  IUser,
  void,
  { rejectValue: string }
>("auth/loginAsGuest", async (_, { rejectWithValue }) => {
  try {
    // Get guest user data from localStorage (set by the modal)
    const guestData = localStorage.getItem("guestUserData");

    if (guestData) {
      const guestUser = JSON.parse(guestData);
      toast.success("Logged in as guest! You can browse and order food.");
      return guestUser;
    } else {
      // Fallback for direct guest login (without phone)
      const guestUser: IUser = {
        userId: `guest_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        username: "Guest User",
        email: `guest_${Date.now()}@guest.com`,
        role: "user",
        phoneNumber: undefined,
        phoneVerified: false,
      };

      localStorage.setItem("guestUserData", JSON.stringify(guestUser));
      toast.success("Logged in as guest! You can browse and order food.");
      return guestUser;
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Guest login failed. Please try again.";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Async thunk to log out user
export const logoutAsync = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Clear guest user data if exists
    localStorage.removeItem("guestUserData");

    // Try to delete Appwrite session if user was authenticated
    try {
      await account.deleteSession("current");
    } catch (error) {
      // Session might not exist for guest users, which is fine
      console.log("No Appwrite session to delete (guest user)");
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Logout failed. Please try again.";
    toast.error(message);
    return rejectWithValue(message);
  }
});

// Async thunk to fetch current user
export const getCurrentUserAsync = createAsyncThunk<
  IUser | null,
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    // First check if there's a guest user in localStorage
    try {
      const guestData = localStorage.getItem("guestUserData");
      if (guestData) {
        const guestUser = JSON.parse(guestData);
        return guestUser;
      }
    } catch (error) {
      console.warn("Failed to get guest data from localStorage:", error);
    }

    // If no guest user, try to get authenticated user from Appwrite
    const user = await account.get();

    // Get phone number from localStorage if available
    let phoneNumber: string | undefined;
    let phoneVerified: boolean | undefined;

    try {
      const phoneData = localStorage.getItem("userPhoneData");
      if (phoneData) {
        const parsed = JSON.parse(phoneData);
        phoneNumber = parsed.phoneNumber;
        phoneVerified = parsed.verified;
      }
    } catch (error) {
      console.warn("Failed to get phone data from localStorage:", error);
    }

    return {
      userId: user.$id,
      username: user.name,
      email: user.email,
      role: user.email === "nwiboazubuike@gmail.com" ? "admin" : "user",
      phoneNumber,
      phoneVerified,
    };
  } catch (error) {
    // No user logged in, return null
    return null;
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<IUser>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.loading = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(
        loginAsync.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Login failed";
        }
      )
      .addCase(logoutAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.loading = "succeeded";
        state.user = null;
        state.error = null;
      })
      .addCase(
        logoutAsync.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Logout failed";
        }
      )
      .addCase(getCurrentUserAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        getCurrentUserAsync.fulfilled,
        (state, action: PayloadAction<IUser | null>) => {
          state.loading = "succeeded";
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(
        getCurrentUserAsync.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Failed to fetch user";
        }
      )
      // Guest login cases
      .addCase(loginAsGuestAsync.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(
        loginAsGuestAsync.fulfilled,
        (state, action: PayloadAction<IUser>) => {
          state.loading = "succeeded";
          state.user = action.payload;
          state.error = null;
        }
      )
      .addCase(
        loginAsGuestAsync.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = "failed";
          state.error = action.payload || "Guest login failed";
        }
      );
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
