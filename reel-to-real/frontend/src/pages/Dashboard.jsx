import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, LogOut, Upload, Video, Loader, 
  CheckCircle, XCircle, Clock, Map, List as ListIcon, Trash2
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { reelsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const { data } = await reelsAPI.getUserReels();
      setReels(data.reels);
    } catch (error) {
      toast.error('Failed to load reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

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
              <Link to="/places" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                <Map className="w-5 h-5" />
                <span className="font-semibold">Places</span>
              </Link>
              <Link to="/itineraries" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                <ListIcon className="w-5 h-5" />
                <span className="font-semibold">Itineraries</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Upload a Reel to discover new places
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Reel
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <StatCard
            title="Total Reels"
            value={reels.length}
            icon={<Video className="w-6 h-6" />}
            color="primary"
          />
          <StatCard
            title="Completed"
            value={reels.filter(r => r.status === 'completed').length}
            icon={<CheckCircle className="w-6 h-6" />}
            color="accent"
          />
          <StatCard
            title="Processing"
            value={reels.filter(r => r.status === 'processing' || r.status === 'pending').length}
            icon={<Clock className="w-6 h-6" />}
            color="primary"
          />
        </div>

        {/* Reels List */}
        <div className="card p-6">
          <h2 className="text-2xl font-display font-bold mb-6">Your Reels</h2>
          
          {isLoading ? (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-gray-600">Loading your reels...</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-4">No reels yet</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="btn btn-primary"
              >
                Upload Your First Reel
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reels.map((reel) => (
                <ReelCard key={reel.id} reel={reel} onUpdate={fetchReels} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchReels}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-display font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function ReelCard({ reel, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusIcon = () => {
    switch (reel.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
      case 'pending':
        return <Loader className="w-5 h-5 text-primary-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (reel.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return `Processing (${reel.progress}%)`;
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleDelete = async () => {
    const isProcessing = reel.status === 'processing' || reel.status === 'pending';
    const confirmMessage = isProcessing
      ? 'This reel is currently processing. Are you sure you want to delete it? The processing job may continue until it fails.'
      : 'Are you sure you want to delete this reel? This action cannot be undone.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      await reelsAPI.deleteReel(reel.id);
      toast.success('Reel deleted successfully');
      onUpdate(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to delete reel');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div>
          <p className="font-semibold text-gray-900">
            {reel.sourceUrl ? 'Instagram Reel' : 'Uploaded Video'}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(reel.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-sm font-semibold text-gray-700">
          {getStatusText()}
        </span>
        {reel.status === 'processing' && (
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${reel.progress}%` }}
            />
          </div>
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Delete reel"
        >
          {isDeleting ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Trash2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

function UploadModal({ onClose, onSuccess }) {
  const [uploadType, setUploadType] = useState('upload'); // 'upload' or 'url'
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (uploadType === 'upload') {
        if (!file) {
          toast.error('Please select a video file');
          return;
        }
        const formData = new FormData();
        formData.append('video', file);
        formData.append('type', 'upload');
        await reelsAPI.ingest(formData);
      } else {
        if (!url) {
          toast.error('Please enter a URL');
          return;
        }
        await reelsAPI.ingest({ type: 'url', url });
      }

      toast.success('Reel queued for processing!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-display font-bold mb-6">Upload Reel</h2>

        {/* Type Selector */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setUploadType('upload')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              uploadType === 'upload'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setUploadType('url')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              uploadType === 'url'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Paste URL
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {uploadType === 'upload' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video File
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="input"
                required
              />
              {file && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instagram Reel URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="input"
                placeholder="https://www.instagram.com/reel/..."
                required
              />
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
