import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateLocation: (longitude, latitude) =>
        api.put('/auth/update-location', { longitude, latitude })
};

// Reels API
export const reelsAPI = {
    ingest: (data) => {
        if (data instanceof FormData) {
            return api.post('/reels/ingest', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        }
        return api.post('/reels/ingest', data);
    },
    getStatus: (id) => api.get(`/reels/${id}`),
    getUserReels: () => api.get('/reels'),
    deleteReel: (id) => api.delete(`/reels/${id}`)
};

// Places API
export const placesAPI = {
    getPlaces: (params) => api.get('/places', { params }),
    getPlace: (id) => api.get(`/places/${id}`),
    savePlace: (placeId) => api.post('/places/save', { placeId }),
    unsavePlace: (placeId) => api.post('/places/unsave', { placeId }),
    searchPlaces: (q) => api.get('/places/search', { params: { q } })
};

// Itineraries API
export const itinerariesAPI = {
    create: (data) => api.post('/itineraries', data),
    getAll: () => api.get('/itineraries'),
    getOne: (id) => api.get(`/itineraries/${id}`),
    update: (id, data) => api.put(`/itineraries/${id}`, data),
    delete: (id) => api.delete(`/itineraries/${id}`),
    addPlace: (id, placeId, notes) =>
        api.post(`/itineraries/${id}/places`, { placeId, notes }),
    removePlace: (id, placeId) =>
        api.delete(`/itineraries/${id}/places/${placeId}`),
    reorder: (id, placeOrders) =>
        api.put(`/itineraries/${id}/reorder`, { placeOrders })
};

export default api;
