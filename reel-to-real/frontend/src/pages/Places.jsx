import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, LogOut, Map as MapIcon, List, Search, Filter } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePlacesStore } from '../stores/placesStore';
import toast from 'react-hot-toast';

export default function Places() {
  const { user, logout } = useAuthStore();
  const { places, viewMode, toggleView, fetchPlaces, fetchAllPlaces, isLoading } = usePlacesStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Get user's location and fetch places
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPlaces(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Fallback: fetch ALL places without location filter
          fetchAllPlaces();
          toast.error('Location access denied. Showing default location.');
        }
      );
    } else {
      // No geolocation support - fetch all places
      fetchAllPlaces();
    }
  }, [fetchPlaces, fetchAllPlaces]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-display font-bold gradient-text">
                Reel-to-Real
              </span>
            </Link>

            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors font-semibold">
                Dashboard
              </Link>
              <Link to="/places" className="text-primary-600 font-semibold">
                Places
              </Link>
              <Link to="/itineraries" className="text-gray-700 hover:text-primary-600 transition-colors font-semibold">
                Itineraries
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Discover Places
            </h1>
            <p className="text-gray-600 text-lg">
              {places.length} places found near you
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-80"
                placeholder="Search places..."
              />
            </div>

            {/* View Toggle */}
            <button
              onClick={toggleView}
              className="btn btn-secondary"
            >
              {viewMode === 'map' ? (
                <>
                  <List className="w-5 h-5 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <MapIcon className="w-5 h-5 mr-2" />
                  Map View
                </>
              )}
            </button>

            {/* Filters */}
            <button className="btn btn-secondary">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="card p-12 text-center">
            <p className="text-gray-600">Loading places...</p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="card p-4">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-24 h-24 text-primary-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Map view - Integrate Mapbox GL JS here
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {places.length} places ready to display
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places
              .filter(place => 
                place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                place.address.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceCard({ place }) {
  return (
    <div className="card p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-bold mb-1">{place.name}</h3>
          <p className="text-sm text-gray-600">{place.address}</p>
        </div>
        {place.rating && (
          <div className="flex items-center space-x-1 bg-accent-100 text-accent-700 px-3 py-1 rounded-full">
            <span className="text-sm font-bold">★ {place.rating}</span>
          </div>
        )}
      </div>

      {place.specialties && place.specialties.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {place.specialties.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      )}

      {place.distance && (
        <p className="text-sm text-gray-500 mb-4">
          📍 {(place.distance / 1000).toFixed(1)} km away
        </p>
      )}

      <div className="flex space-x-2">
        <button className="btn btn-primary flex-1 text-sm">
          Save Place
        </button>
        <button className="btn btn-secondary flex-1 text-sm">
          View Details
        </button>
      </div>
    </div>
  );
}
