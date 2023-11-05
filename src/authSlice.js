// src/features/auth/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async (adminCredentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/login_admin', adminCredentials);
      const { access_token } = response.data;
      if (!access_token || access_token.split('.').length !== 3) {
        throw new Error('Access token received from the server is not valid JWT.');
      }
      localStorage.setItem('token', access_token);
      return response.data; // This should include the admin info and tokens
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'An error occurred during admin login.');
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (userCredentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/login_user', userCredentials);
      const { access_token } = response.data;
      if (!access_token || access_token.split('.').length !== 3) {
        throw new Error('Access token received from the server is not valid JWT.');
      }
      localStorage.setItem('token', access_token);
      return response.data; // This should include the user info and tokens
    } catch (err) {
      return rejectWithValue(err.response.data.message || 'An error occurred during user login.');
    }
  }
);

// Slice for authentication-related data
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    // define additional reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // save admin data
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // save error message
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // save user data
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // save error message
      });
  },
});

export default authSlice.reducer;
