// src/helpers/authHelper.js

export const saveToken = (token) => {
    localStorage.setItem('authToken', token);
    
  };
  
  
  export const getToken = () => {
    return localStorage.getItem('authToken');
  };
 
  
  export const saveUserDetails = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  export const getUserDetails = () => {
    return JSON.parse(localStorage.getItem('user'));
  };
  
  export const clearAuthInfo = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };
  