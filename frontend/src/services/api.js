import axios from 'axios';

// Base URL for API
const normalizeApiBaseUrl = (url) => {
    const trimmed = url.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
export const GOOGLE_AUTH_URL = `${API_URL}/auth/google`;

const TAB_AUTH_TOKEN_KEY = 'ns.tab.auth.token';
const TAB_AUTH_USER_KEY = 'ns.tab.auth.user';

const hasWindow = () => typeof window !== 'undefined';

export const getTabAuthToken = () => {
    if (!hasWindow()) return null;
    return window.sessionStorage.getItem(TAB_AUTH_TOKEN_KEY);
};

export const getTabAuthUser = () => {
    if (!hasWindow()) return null;
    const raw = window.sessionStorage.getItem(TAB_AUTH_USER_KEY);
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const persistTabAuthSession = ({ token, user }) => {
    if (!hasWindow()) return;

    if (token) {
        window.sessionStorage.setItem(TAB_AUTH_TOKEN_KEY, token);
    }

    if (user) {
        window.sessionStorage.setItem(TAB_AUTH_USER_KEY, JSON.stringify(user));
    }
};

export const clearTabAuthSession = () => {
    if (!hasWindow()) return;
    window.sessionStorage.removeItem(TAB_AUTH_TOKEN_KEY);
    window.sessionStorage.removeItem(TAB_AUTH_USER_KEY);
};

export const redirectToGoogleAuth = () => {
    if (!hasWindow()) return;

    // Clear any stale tab token first so OAuth callback resolves the account from fresh auth.
    clearTabAuthSession();
    window.location.assign(GOOGLE_AUTH_URL);
};

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for cookies
});

api.interceptors.request.use((config) => {
    const token = getTabAuthToken();
    if (!token) return config;

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Auth API Calls
export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        persistTabAuthSession({ token: response.data.token, user: response.data.user });
        return { success: true, user: response.data.user };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
        };
    }
};

export const adminLoginUser = async (loginId, password) => {
    try {
        const response = await api.post('/auth/admin/login', { loginId, password });
        persistTabAuthSession({ token: response.data.token, user: response.data.user });
        return { success: true, user: response.data.user };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Admin login failed',
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
        persistTabAuthSession({ token: response.data.token, user: response.data.user });
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
        clearTabAuthSession();
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        clearTabAuthSession();
        return { success: false };
    }
};

export const checkAuth = async () => {
    try {
        const response = await api.get('/auth/me');
        persistTabAuthSession({ token: response.data.token, user: response.data.user });
        return { success: true, user: response.data.user };
    } catch (error) {
        clearTabAuthSession();
        return { success: false };
    }
};

// Profile API Calls
export const updateProfileInfo = async (data) => {
    try {
        const response = await api.put('/profile/info', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Update failed');
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

export const uploadGalleryImage = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/profile/gallery-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Upload failed';
    }
};

export const deleteGalleryImage = async (imagePath) => {
    try {
        const response = await api.delete('/profile/gallery-image', {
            data: { imagePath }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Delete failed';
    }
};

export const uploadJathagam = async (file) => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/profile/jathagam', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Upload failed';
    }
};

// --- NEW: Chunked Upload Implementation ---
export const uploadFileWithChunks = async ({
    file,
    modelName = "User",
    fieldName = "profileImages",
    operation = "push",
    onProgress = () => {}
}) => {
    console.log(`Starting chunked upload for ${file.name} to ${fieldName}`);
    const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const uploadId = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("image", chunk, file.name);
        formData.append("chunkNumber", i);
        formData.append("totalChunks", totalChunks);
        formData.append("uploadId", uploadId);

        try {
            await api.post("/profile/upload-chunk", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            console.log(`Chunk ${i} uploaded successfully`);
        } catch (err) {
            console.error(`Chunk ${i} upload failed`, err);
            throw err;
        }

        // Report progress
        const percentCompleted = Math.round(((i + 1) / totalChunks) * 90); // 90% is chunks, 10% is completion
        onProgress(percentCompleted);
    }

    console.log(`Completing upload for ${uploadId}`);
    const response = await api.post("/profile/complete-upload", {
        uploadId,
        fileName: file.name,
        modelName,
        fieldName,
        operation
    });

    onProgress(100);
    return response.data;
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

// Admin API Calls
export const getAdminUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Fetch admin users error:', error);
        throw error.response?.data?.message || 'Failed to fetch users';
    }
};

export const getPendingAdminUsers = async () => {
    try {
        const response = await api.get('/admin/pending');
        return response.data;
    } catch (error) {
        console.error('Fetch pending users error:', error);
        throw error.response?.data?.message || 'Failed to fetch pending users';
    }
};

export const getAdminInsights = async () => {
    try {
        const response = await api.get('/admin/insights');
        return response.data;
    } catch (error) {
        console.error('Fetch admin insights error:', error);
        throw error.response?.data?.message || 'Failed to fetch admin insights';
    }
};

export const verifyAdminUser = async (userId, isVerified) => {
    try {
        const response = await api.patch(`/admin/users/${userId}/verify`, { isVerified });
        return response.data;
    } catch (error) {
        console.error('Verify user error:', error);
        throw error.response?.data?.message || 'Failed to update verification status';
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
