import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            username,
            password
        });
        
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        
        return response.data;
    } catch (error) {
        console.error('Auth service error:', error);
        throw error;
    }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.token;
};

export const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: user.token };
  } else {
    return {};
  }
};