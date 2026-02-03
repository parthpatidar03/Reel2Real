import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Zap, Heart, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-display font-bold gradient-text">
              Reel-to-Real
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="btn btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-display font-bold mb-6">
            Transform{' '}
            <span className="gradient-text">Reels & Shorts</span>
            <br />
            into Real Places
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop losing track of amazing cafes, restaurants, and hidden gems.
            Reel-to-Real automatically extracts venue information from Instagram Reels 
            and YouTube Shorts, creating a searchable, mappable database of places to visit.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-4">
              Start Discovering
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary text-lg px-8 py-4">
              See How It Works
            </a>
          </div>
        </motion.div>

        {/* Hero Image/Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="card p-4">
            <div className="aspect-video bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-24 h-24 text-primary-500 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  Interactive map view coming soon
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powered by AI to extract venue information from videos automatically
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            icon={<Sparkles className="w-12 h-12" />}
            title="Smart Extraction"
            description="AI analyzes audio and visual content to identify venue names, addresses, and specialties"
            delay={0}
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="Auto-Enrichment"
            description="Matches extracted data with Google Places to get ratings, photos, and verified information"
            delay={0.1}
          />
          <FeatureCard
            icon={<Heart className="w-12 h-12" />}
            title="Save & Organize"
            description="Create itineraries, save favorites, and view everything on an interactive map"
            delay={0.2}
          />
        </div>
      </section>

      {/* How to Use Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-display font-bold text-center mb-12">
              Three Simple Steps
            </h2>
            <div className="space-y-8">
              <Step
                number="1"
                title="Upload Your Video"
                description="Paste an Instagram Reel or YouTube Shorts URL, or upload a video file directly (max 90 seconds)"
              />
              <Step
                number="2"
                title="AI Does the Work"
                description="Our AI extracts venue information, matches it with real places, and calculates confidence scores"
              />
              <Step
                number="3"
                title="Explore & Save"
                description="View places on a map, save your favorites, and create custom itineraries"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="card p-12 text-center bg-gradient-to-br from-primary-500 to-accent-500 text-white"
        >
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Discover?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users finding hidden gems from their saved Reels
          </p>
          <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-6 h-6" />
              <span className="text-xl font-display font-bold">Reel-to-Real</span>
            </div>
            <p className="text-gray-400">
              {new Date().getFullYear()}  Reel-to-Real. Built with Coffee 🍵 by Parth Patidar.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="card p-8 text-center hover:shadow-xl transition-shadow"
    >
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex items-start space-x-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-2xl font-display font-bold mb-2">{title}</h3>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </div>
  );
}
