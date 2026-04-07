import axios from 'axios';

// Base URL for API
const normalizeApiBaseUrl = (url) => {
    const trimmed = url.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

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
        const response = await api.post('/profile/profile-image', formData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Upload failed';
    }
};

// Match API Calls
export const getMatches = async (filters = {}) => {
    try {
        const response = await api.get('/matches', { params: filters });
        return response.data;
    } catch (error) {
        console.error('Fetch matches error:', error);
        throw error.response?.data?.message || 'Failed to fetch matches';
    }
};

export const expressInterest = async (matchId) => {
    try {
        const response = await api.post(`/matches/${matchId}/interest`);
        return response.data;
    } catch (error) {
        console.error('Express interest error:', error);
        throw error.response?.data?.message || 'Failed to express interest';
    }
};

// Notification API Calls
export const getNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        return response.data;
    } catch (error) {
        console.error('Fetch notifications error:', error);
        throw error.response?.data?.message || 'Failed to fetch notifications';
    }
};

export const markNotificationAsRead = async (id) => {
    try {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        console.error('Mark notification error:', error);
        throw error.response?.data?.message || 'Failed to update notification';
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.patch('/notifications/read-all');
        return response.data;
    } catch (error) {
        console.error('Mark all read error:', error);
        throw error.response?.data?.message || 'Failed to update notifications';
    }
};

export const getMatchDetail = async (userId) => {
    try {
        const response = await api.get(`/matches/detail/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Fetch match detail error:', error);
        throw error.response?.data?.message || 'Failed to fetch match details';
    }
};

export default api;
