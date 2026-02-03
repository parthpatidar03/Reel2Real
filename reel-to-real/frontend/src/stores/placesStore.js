import { create } from 'zustand';
import { placesAPI } from '../services/api';

export const usePlacesStore = create((set, get) => ({
    places: [],
    selectedPlace: null,
    viewMode: 'map', // 'map' or 'list'
    isLoading: false,
    error: null,
    filters: {
        category: null,
        savedOnly: false,
        radius: 5000
    },

    setPlaces: (places) => set({ places }),

    selectPlace: (place) => set({ selectedPlace: place }),

    toggleView: () => set((state) => ({
        viewMode: state.viewMode === 'map' ? 'list' : 'map'
    })),

    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
    })),

    fetchPlaces: async (lat, lng) => {
        set({ isLoading: true, error: null });
        try {
            const { filters } = get();
            const { data } = await placesAPI.getPlaces({
                lat,
                lng,
                radius: filters.radius,
                category: filters.category,
                savedOnly: filters.savedOnly
            });
            set({ places: data.places, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch places',
                isLoading: false
            });
        }
    },

    savePlace: async (placeId) => {
        try {
            await placesAPI.savePlace(placeId);
            // Refresh places
            const { fetchPlaces } = get();
            fetchPlaces();
        } catch (error) {
            console.error('Failed to save place:', error);
        }
    },

    unsavePlace: async (placeId) => {
        try {
            await placesAPI.unsavePlace(placeId);
            // Refresh places
            const { fetchPlaces } = get();
            fetchPlaces();
        } catch (error) {
            console.error('Failed to unsave place:', error);
        }
    },

    searchPlaces: async (query) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await placesAPI.searchPlaces(query);
            set({ places: data.places, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Search failed',
                isLoading: false
            });
        }
    },

    // Fetch all places without geo-filtering
    fetchAllPlaces: async () => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await placesAPI.getPlaces({});
            set({ places: data.places, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error?.message || 'Failed to fetch places',
                isLoading: false
            });
        }
    }
}));
