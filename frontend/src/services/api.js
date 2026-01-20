import axios from 'axios';

// Base URL for API
const API_URL = 'http://localhost:5000/api';
export const GOOGLE_AUTH_URL = 'http://localhost:5000/api/auth/google';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth API Calls
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        return { success: true, user: response.data.user };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
        };
    }
};

export const SignUp = async (fullname, email, password, confirmPassword) => {
    try {
        const response = await api.post('/auth/signup', {
            fullname,
            email,
            password,
            confirmPassword,
        });
        return { success: true, user: response.data.user };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Signup failed',
        };
    }
};

export const logoutUser = async () => {
    try {
        const response = await api.get('/auth/logout');
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false };
    }
};

export const checkAuth = async () => {
    try {
        const response = await api.get('/auth/me');
        return { success: true, user: response.data.user };
    } catch (error) {
        return { success: false };
    }
};

// Profile API Calls
export const updateProfileInfo = async (data) => {
    try {
        const response = await api.put('/profile/info', data);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Update failed';
    }
};

export const uploadProfileImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/profile/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Upload failed';
    }
};

export default api;
