// features/orderSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../helpers/axiosConfig';


// Async thunk for placing a new order
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData) => {
    const response = await axiosInstance.post('/api/orders', orderData);
    return response.data;
  }
);

// Async thunk for fetching user orders
export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId) => {
    const response = await axios.get(`/api/orders?userId=${userId}`);
    return response.data;
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;
