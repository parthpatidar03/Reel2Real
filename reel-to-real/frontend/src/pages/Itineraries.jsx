import { Link } from 'react-router-dom';
import { MapPin, LogOut, Plus, List as ListIcon } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Itineraries() {
  const { logout } = useAuthStore();

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
              <Link to="/places" className="text-gray-700 hover:text-primary-600 transition-colors font-semibold">
                Places
              </Link>
              <Link to="/itineraries" className="text-primary-600 font-semibold">
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
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              My Itineraries
            </h1>
            <p className="text-gray-600 text-lg">
              Plan your perfect day with custom itineraries
            </p>
          </div>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            New Itinerary
          </button>
        </div>

        {/* Empty State */}
        <div className="card p-12 text-center">
          <ListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold mb-2">
            No itineraries yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first itinerary to organize your favorite places
          </p>
          <button className="btn btn-primary">
            <Plus className="w-5 h-5 mr-2" />
            Create Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}
