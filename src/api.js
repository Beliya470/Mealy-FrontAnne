import axios from 'axios';

// Create an Axios instance
const API = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to validate the format of the JWT
const validateTokenFormat = (token) => {
  const segments = token.split('.');
  if (segments.length === 3) {
    return true; // The token has three parts
  }
  console.error('Token has invalid format:', token);
  return false; // The token is not in the correct format
};

// Function to add the Authorization header to requests
const addAuthToken = (req) => {
  const token = localStorage.getItem('authToken');
  if (token && validateTokenFormat(token)) {
    req.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error('Invalid or no token in localStorage');
  }
  return req;
};

// Add a request interceptor to include the token before sending the request
API.interceptors.request.use(addAuthToken);

/* ------------------ User/Auth Related Requests ------------------ */

// User Registration
export const register = async (formData) => {
  const response = await API.post('/register', formData);
  alert('Registration successful');
  if (response.status === 409) {
    throw new Error('Username already exists');
  }
  return response;
};

export const googleAuth = () => API.get('/auth/google');
export const facebookAuth = () => API.get('/auth/facebook');
export const emailAuth = (formData) => API.post('/auth/email', formData);

// User Login
// User Login
export const signInUser = (formData) => API.post('/login_user', formData);

// Admin Login
export const signInAdmin = (formData) => API.post('/login_admin', formData);


/* ------------------ Admin Related Requests ------------------ */

// Fetch all admins
export const fetchAdmins = () => API.get('/admins');

// Fetch single admin
export const fetchAdmin = (id) => API.get(`/admins/${id}`);

// Admin creating a meal
export const createMeal = (mealData) => API.post('/meals', mealData);

// Admin updating a meal
export const updateMeal = (id, updatedMealData) => API.put(`/meals/${id}`, updatedMealData);

// Admin deleting a meal
export const deleteMeal = (id) => API.delete(`/meals/${id}`);

// Admin setting up the menu for the day
export const createMenu = (menuData) => API.post('/menu', menuData);

// Fetch menu for the day
export const fetchMenu = (admin_id) => API.get('/menu', { params: { admin_id } });

// Place an order
export const placeOrder = (orderData) => API.post('/order', orderData);

// Change meal choice (i.e., update the order)
export const updateOrder = (updatedOrderData) => API.put('/order', updatedOrderData);

// Fetch order history for a customer
export const fetchOrderHistory = (user_id) => API.get('/order/history', { params: { user_id } });

/* ------------------ Admin Specific Requests ------------------ */

// View all orders for the day
export const fetchTodaysOrders = (admin_id) => API.get('/orders', { params: { admin_id } });

// View total amount of money made by the end of the day
export const fetchTodaysEarnings = (admin_id) => API.get('/earnings', { params: { admin_id } });

/* ------------------ Admin Registration ------------------ */

// Admin Registration
export const registerAdmin = async (adminData) => {
  const response = await API.post('/admin/register', adminData);
  alert('Admin registration successful');
  if (response.status === 409) {
    throw new Error('Username already exists');
  }
  return response;
};

// Export the API instance for global usage
export default API;
