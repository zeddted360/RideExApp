import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartItemFetched, ICartItemOrder } from "../../types/types";
import { databases, validateEnv } from "@/utils/appwrite";
import { ID } from "appwrite";

interface IOrderState {
  orders: ICartItemFetched[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: IOrderState = {
  orders: null,
  loading: false,
  error: null,
};


export const createOrderAsync = createAsyncThunk<
  ICartItemFetched, 
  ICartItemOrder,
  { rejectValue: string } 
>("orders/createOrder", async (orderData, { rejectWithValue }) => {
    try {
        const { databaseId, orderId } = validateEnv();
        
    const response = await databases.createDocument(
      databaseId,
      orderId,
      ID.unique(), 
      orderData
    );

    return response as ICartItemFetched; 
  } catch (error) {
    return rejectWithValue( error instanceof Error ? error.message : "Failed to create order");
  }
});

// Order slice
export const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Reset orders state
    resetOrders(state) {
      state.orders = null;
      state.loading = false;
      state.error = null;
    },
    // Update an order locally
    updateOrder(state, action: { payload: ICartItemFetched }) {
      if (state.orders) {
        state.orders = state.orders.map((order) =>
          order.$id === action.payload.$id ? action.payload : order
        );
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderAsync.fulfilled, (state, action:PayloadAction<ICartItemFetched>) => {
        state.loading = false;
        state.error = null;
        state.orders = state.orders
          ? [...state.orders, action.payload]
          : [action.payload];
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create order";
      });
  },
});

// Export actions
export const { resetOrders, updateOrder } = orderSlice.actions;

// Export reducer
export default orderSlice.reducer;
