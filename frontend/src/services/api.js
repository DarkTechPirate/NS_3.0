import axios from 'axios';

// Base URL for API — use relative path so Vite proxy handles routing in both dev and Docker
const API_URL = '/api';
export const GOOGLE_AUTH_URL = '/api/auth/google';

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

// Match API Calls
export const getMatches = async () => {
    try {
        const response = await api.get('/matches');
        return { success: true, matches: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch matches',
            matches: [],
        };
    }
};

export const getMatchDetail = async (id) => {
    try {
        const response = await api.get(`/matches/${id}`);
        return { success: true, match: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch match detail',
        };
    }
};

export const expressInterest = async (id) => {
    try {
        const response = await api.post(`/matches/${id}/interest`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to express interest',
        };
    }
};

export const declineMatch = async (id) => {
    try {
        const response = await api.post(`/matches/${id}/decline`);
        return response.data;
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to decline match',
        };
    }
};

export const updateFamilyReview = async (id, data) => {
    try {
        const response = await api.patch(`/matches/${id}/family-review`, data);
        return { success: true, ...response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to update family review',
        };
    }
};

// Conversation API Calls
export const getConversations = async () => {
    try {
        const response = await api.get('/conversations');
        return { success: true, conversations: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch conversations',
            conversations: [],
        };
    }
};

export const getMessages = async (conversationId) => {
    try {
        const response = await api.get(`/conversations/${conversationId}/messages`);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to fetch messages',
        };
    }
};

export const sendMessage = async (conversationId, text) => {
    try {
        const response = await api.post(`/conversations/${conversationId}/messages`, { text });
        return { success: true, message: response.data };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send message',
        };
    }
};

export default api;
