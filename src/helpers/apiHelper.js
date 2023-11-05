// src/helpers/apiHelper.js
import axiosInstance from '../helpers/axiosConfig';


const API_BASE_URL = 'http://localhost:5000'; // Replace with your actual Flask API base URL

const getAxiosInstance = (token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.create({ baseURL: API_BASE_URL, headers });
};

// ================= AUTHENTICATION =================
export const loginUser = async (credentials) => {
  try {
    const response = await getAxiosInstance().post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await getAxiosInstance().post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ================= ADMIN REGISTRATION =================
export const registerAdmin = async (adminData) => {
  try {
    const response = await getAxiosInstance().post('/admin/register', adminData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ================= MENU =================
export const fetchMenu = async () => {
  try {
    const response = await getAxiosInstance().get('/menu');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminSetMenu = async (menuData, token) => {
  try {
    const response = await getAxiosInstance(token).post('/menu', menuData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ================= MEALS =================
export const fetchMealDetails = async (mealId) => {
  try {
    const response = await getAxiosInstance().get(`/meals/${mealId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminAddMeal = async (mealData, token) => {
  try {
    const response = await getAxiosInstance(token).post('/meals', mealData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminUpdateMeal = async (mealId, mealData, token) => {
  try {
    const response = await getAxiosInstance(token).put(`/meals/${mealId}`, mealData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminDeleteMeal = async (mealId, token) => {
  try {
    const response = await getAxiosInstance(token).delete(`/meals/${mealId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ================= ORDERS =================
export const placeOrder = async (orderDetails, token) => {
  try {
    const response = await getAxiosInstance(token).post('/orders', orderDetails);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchOrderHistory = async (token) => {
  try {
    const response = await getAxiosInstance(token).get('/orders/history');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const adminFetchOrders = async (token) => {
  try {
    const response = await getAxiosInstance(token).get('/orders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add more API helper functions here as needed.
