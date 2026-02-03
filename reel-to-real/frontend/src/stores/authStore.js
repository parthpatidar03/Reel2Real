import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authAPI.login({ email, password });
            localStorage.setItem('token', data.token);
            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false
            });
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await authAPI.register({ email, password, name });
            localStorage.setItem('token', data.token);
            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false
            });
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error?.message || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    },

    fetchUser: async () => {
        try {
            const { data } = await authAPI.getMe();
            set({ user: data.user });
        } catch (error) {
            console.error('Failed to fetch user:', error);
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('token');
        }
    },

    updateLocation: async (longitude, latitude) => {
        try {
            const { data } = await authAPI.updateLocation(longitude, latitude);
            set({ user: data.user });
        } catch (error) {
            console.error('Failed to update location:', error);
        }
    }
}));
