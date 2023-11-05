// features/menuSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../helpers/axiosConfig';


// Async thunk for fetching daily menu
export const fetchDailyMenu = createAsyncThunk(
  'menu/fetchDailyMenu',
  async () => {
    const response = await axios.get('/api/menus/daily');
    return response.data;
  }
);

// Async thunk for setting daily menu
export const setDailyMenu = createAsyncThunk(
  'menu/setDailyMenu',
  async (mealsForToday) => {
    const response = await axiosInstance.post('/api/menus/daily', mealsForToday);
    return response.data;
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    dailyMenu: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDailyMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDailyMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyMenu = action.payload;
      })
      .addCase(fetchDailyMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(setDailyMenu.pending, (state) => {
        state.loading = true;
      })
      .addCase(setDailyMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyMenu = action.payload;
      })
      .addCase(setDailyMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default menuSlice.reducer;
