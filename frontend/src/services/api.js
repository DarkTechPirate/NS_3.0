import axios from 'axios';

// Base URL for API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
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
        const response = await api.post('/profile/profile-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
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
