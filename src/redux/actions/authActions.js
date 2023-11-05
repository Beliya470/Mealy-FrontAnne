import axiosInstance from '../../helpers/axiosConfig.js';

// Helper function to save tokens correctly
const saveToken = (key, token) => {
  localStorage.setItem(key, token);
};

const getToken = (key) => {
  return localStorage.getItem(key);
};

// Register User
export const registerUser = (userData, history, setSuccessMessage) => {
  return async (dispatch) => {
    try {
      await axiosInstance.post('/register', userData);
      console.log("Registration successful, redirecting to login...");
      setSuccessMessage("Registration successful!");
      setTimeout(() => {
        history.push(userData.role === "user" ? '/login_user' : '/login_admin');
      }, 2000);
    } catch (error) {
      console.log("Registration error:", error.response?.data);
      dispatch({
        type: 'REGISTER_FAIL',
        payload: error.response?.data?.message ? { username: 'Username already exists' } : error.response?.data
      });
    }
  };
};

// Login Admin
export const loginAdmin = (loginData) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post('/login_admin', loginData);
      console.log("Login successful, received tokens:", response.data);
      saveToken('authToken', response.data.access_token);
      saveToken('refreshToken', response.data.refresh_token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      console.log("Login error:", error.response?.data);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.response?.data
      });
    }
  };
};

// Login User
export const loginUser = (loginData) => {
  return async (dispatch) => {
    try {
      const response = await axiosInstance.post('/login_user', loginData);
      console.log("Login successful, received tokens:", response.data);
      saveToken('authToken', response.data.access_token);
      saveToken('refreshToken', response.data.refresh_token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      console.log("Login error:", error.response?.data);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: error.response?.data
      });
    }
  };
};

// Refresh Token
export const refreshToken = () => {
  return async () => {
    try {
      const refreshToken = getToken('refreshToken');
      const response = await axiosInstance.post('/token/refresh', {}, {
        headers: {
          'Authorization': 'Bearer ' + refreshToken
        }
      });
      console.log("Refresh token successful, received new access token:", response.data);
      saveToken('authToken', response.data.access_token);
    } catch (error) {
      console.log("Token refresh error:", error.response?.data);
    }
  };
};

// Get User Details
export const getUserDetails = () => {
  return async (dispatch) => {
    try {
      const authToken = getToken('authToken');
      const response = await axiosInstance.get('/users/me', {
        headers: {
          'Authorization': 'Bearer ' + authToken
        }
      });
      console.log("User details fetched:", response.data);
      dispatch({
        type: 'FETCH_USER_DETAILS_SUCCESS',
        payload: response.data
      });
    } catch (error) {
      console.log("Fetching user details error:", error.response?.data);
      if (error.response?.status === 422) {
        // Handle 422 error here
      }
      dispatch({
        type: 'FETCH_USER_DETAILS_FAIL',
        payload: error.response?.data
      });
    }
  };
};

// Logout User
export const logoutUser = () => {
  return (dispatch) => {
    console.log("Logging out...");
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    dispatch({
      type: 'LOGOUT'
    });
  };
};
