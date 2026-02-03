# Reel-to-Real: Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Getting Started](#getting-started)
5. [Backend Documentation](#backend-documentation)
6. [Worker Pipeline](#worker-pipeline)
7. [Frontend Documentation](#frontend-documentation)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Deployment Guide](#deployment-guide)

---

## Project Overview

**Reel-to-Real** is a full-stack MERN application that automatically transforms Instagram Reels into a searchable database of real-world places using AI-powered extraction.

### Problem Statement
Users save Instagram Reels about cafes, restaurants, and venues but can't search, filter, or find them later because the data is trapped inside videos.

### Solution
Automated AI pipeline that:
- Extracts audio and transcribes with OpenAI Whisper
- Performs OCR on video frames with Tesseract
- Extracts venue entities with GPT-4
- Resolves locations with Google Places API
- Provides interactive map and list views

### Key Features
- ✅ **Smart Extraction**: Multi-modal AI processing (audio + visual)
- ✅ **Geospatial Search**: Find places near you with 2dsphere indexing
- ✅ **Confidence Scoring**: Weighted algorithm for match validation
- ✅ **Async Processing**: Queue-based workers with BullMQ
- ✅ **Save & Organize**: Create itineraries and save favorite spots

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Landing  │  │Dashboard │  │ Places   │  │Itinerary │       │
│  │  Page    │  │          │  │ (Map)    │  │  Page    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│         │              │              │              │          │
│         └──────────────┴──────────────┴──────────────┘          │
│                        │ Axios HTTP                             │
└────────────────────────┼────────────────────────────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API SERVER (Express.js)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Routes: /auth, /reels, /places, /itineraries            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Controllers: Auth, Reel, Place, Itinerary               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Middleware: JWT Auth, Validation, Error Handler         │  │
│  └──────────────────────────────────────────────────────────┘  │
│              │                           │                      │
│              ▼                           ▼                      │
│      ┌──────────────┐          ┌──────────────┐                │
│      │   MongoDB    │          │  BullMQ      │                │
│      │   Database   │          │  Queue       │                │
│      └──────────────┘          └──────────────┘                │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WORKER SERVICE (Node.js)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PROCESS_REEL Job Pipeline                   │  │
│  │                                                           │  │
│  │  1. Extract Audio (ffmpeg)                               │  │
│  │  2. Transcribe Audio (OpenAI Whisper)                    │  │
│  │  3. Extract Frames (ffmpeg)                              │  │
│  │  4. Perform OCR (Tesseract.js)                           │  │
│  │  5. Extract Entities (GPT-4)                             │  │
│  │  6. Resolve Place (Google Places API)                    │  │
│  │  7. Calculate Confidence Score                           │  │
│  │  8. Save to Database                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  External APIs: Whisper, GPT-4, Google Places                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.0 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Zustand | 4.4 | State management |
| Framer Motion | 10.18 | Animations |
| Mapbox GL JS | 3.0 | Interactive maps |
| React Router | 6.21 | Client-side routing |
| Axios | 1.6 | HTTP client |
| React Hot Toast | 2.4 | Notifications |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18 | Web framework |
| MongoDB | 6+ | Database |
| Mongoose | 8.0 | ODM |
| BullMQ | 5.1 | Job queue |
| Redis | 7+ | Queue storage |
| JWT | 9.0 | Authentication |
| Multer | 1.4 | File uploads |
| bcryptjs | 2.4 | Password hashing |

### Worker & AI
| Technology | Version | Purpose |
|------------|---------|---------|
| OpenAI API | 4.24 | Whisper + GPT-4 |
| Tesseract.js | 5.0 | OCR |
| fluent-ffmpeg | 2.1 | Video processing |
| Google Places API | 1.1 | Location resolution |
| string-similarity | 4.0 | Confidence scoring |

---

## Getting Started

### Prerequisites

```bash
# Required software
Node.js 18+
MongoDB 6+
Redis 7+

# Required API keys
OPENAI_API_KEY      # For Whisper & GPT-4
GOOGLE_PLACES_API_KEY  # For place resolution
VITE_MAPBOX_TOKEN   # For frontend maps
```

### Installation

```bash
# 1. Clone repository
git clone <repo-url>
cd reel-to-real

# 2. Install dependencies
npm install
cd backend && npm install
cd ../worker && npm install
cd ../frontend && npm install

# 3. Set up environment variables
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Worker
cp worker/.env.example worker/.env
# Edit worker/.env with your API keys

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with Mapbox token

# 4. Start MongoDB and Redis
mongod
redis-server

# 5. Start services (in separate terminals)
cd backend && npm run dev
cd worker && npm run dev
cd frontend && npm run dev

# 6. Open browser
http://localhost:5173
```

### Docker Setup (Alternative)

```bash
# Start all services with Docker Compose
docker-compose up

# Services will be available at:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

---

## Backend Documentation

### Project Structure

```
backend/
├── config/
│   ├── database.js       # MongoDB connection
│   ├── queue.js          # BullMQ configuration
│   └── upload.js         # Multer file upload
├── controllers/
│   ├── authController.js      # Auth logic
│   ├── reelController.js      # Reel ingestion
│   ├── placeController.js     # Places CRUD
│   └── itineraryController.js # Itineraries CRUD
├── middleware/
│   ├── auth.js           # JWT verification
│   ├── errorHandler.js   # Global error handling
│   └── validate.js       # Input validation
├── models/
│   ├── User.js           # User schema
│   ├── Reel.js           # Reel schema
│   ├── Place.js          # Place schema
│   ├── ExtractedPlace.js # Extraction tracking
│   └── Itinerary.js      # Itinerary schema
├── routes/
│   ├── auth.js           # Auth endpoints
│   ├── reels.js          # Reel endpoints
│   ├── places.js         # Place endpoints
│   └── itineraries.js    # Itinerary endpoints
└── server.js             # Express app entry point
```

### Key Features

#### 1. Authentication (JWT)
- **Registration**: Email/password with bcrypt hashing (10 rounds)
- **Login**: Returns JWT token (7-day expiry)
- **Protected Routes**: Bearer token validation
- **Location Tracking**: GeoJSON Point for user location

#### 2. Reel Ingestion
- **URL Mode**: Accept Instagram Reel URL (queued for download)
- **Upload Mode**: Accept video file (max 100MB)
- **Async Processing**: Job added to BullMQ queue
- **Status Tracking**: Real-time progress updates (0-100%)

#### 3. Places Management
- **Geospatial Queries**: `$near` operator with 2dsphere index
- **Distance Calculation**: Haversine formula
- **Save/Unsave**: User-specific saved places
- **Search**: Full-text search on name, address, specialties

#### 4. Itineraries
- **CRUD Operations**: Create, read, update, delete
- **Place Management**: Add, remove, reorder places
- **Public/Private**: Share itineraries or keep private

---

## Worker Pipeline

### Processing Flow

```javascript
// Job: PROCESS_REEL
{
  reelId: "64a1b2c3d4e5f6g7h8i9j0k1",
  videoPath: "/uploads/reel-123456789.mp4",
  userId: "64a1b2c3d4e5f6g7h8i9j0k2"
}

// Step-by-step execution:
1. Extract Audio (15% progress)
   → ffmpeg extracts MP3 from video
   
2. Transcribe Audio (35% progress)
   → OpenAI Whisper API transcribes to text
   → Example: "This hidden gem in Brooklyn serves the best matcha latte..."
   
3. Extract Frames (45% progress)
   → ffmpeg extracts 1 frame per second
   → Saves as JPG files
   
4. Perform OCR (65% progress)
   → Tesseract.js reads text from frames
   → Example: ["CAFE GRUMPY", "193 Meserole Ave", "Brooklyn, NY"]
   
5. Extract Entities (80% progress)
   → GPT-4 analyzes transcript + OCR text
   → Returns JSON: { name, address, city, specialties, category }
   
6. Resolve Place (90% progress)
   → Google Places API search
   → Confidence scoring algorithm
   
7. Save Results (100% progress)
   → Create/update Place document
   → Create ExtractedPlace record
   → Mark Reel as completed
```

### Confidence Scoring Algorithm

```javascript
confidence = (0.5 × nameSimilarity) + 
             (0.3 × addressSimilarity) + 
             (0.2 × verificationSignals)

// Name Similarity (50% weight)
- Levenshtein distance between extracted and API name
- "Cafe Grumpy" vs "Café Grumpy" = 0.95 similarity

// Address Similarity (30% weight)
- String comparison of addresses
- Partial matches acceptable

// Verification Signals (20% weight)
- Has Google rating: +0.5
- Has photos: +0.25
- Has types: +0.25

// Thresholds
>= 0.8: Auto-save (high confidence)
0.5-0.8: Show for user confirmation
< 0.5: Flag for manual review
```

### Error Handling & Retries

```javascript
// Retry Strategy: Exponential Backoff
Attempt 1: Immediate
Attempt 2: 1 minute delay
Attempt 3: 5 minutes delay
Attempt 4: 15 minutes delay
After 4 failures: Mark as failed

// Failure Classification
- RATE_LIMIT: Retry with backoff
- INVALID_VIDEO: Don't retry, notify user
- API_ERROR: Retry with backoff
- NETWORK_ERROR: Retry with backoff
```

---

## Frontend Documentation

### Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Route pages
│   ├── services/        # API layer
│   ├── stores/          # Zustand state
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

### State Management (Zustand)

#### Auth Store
```javascript
{
  user: { id, email, name, location },
  token: "jwt_token",
  isAuthenticated: true,
  login(email, password),
  register(email, password, name),
  logout(),
  fetchUser(),
  updateLocation(lng, lat)
}
```

#### Places Store
```javascript
{
  places: [...],
  selectedPlace: { ... },
  viewMode: 'map' | 'list',
  filters: { category, savedOnly, radius },
  fetchPlaces(lat, lng),
  savePlace(placeId),
  unsavePlace(placeId),
  searchPlaces(query)
}
```

### Design System

#### Color Palette
```css
/* Primary (Coral/Peach) */
--primary-500: #ff6b4a
--primary-600: #e85a3a

/* Accent (Teal) */
--accent-500: #14b8a6
--accent-600: #0d9488

/* Neutrals */
--gray-50: #fafafa
--gray-900: #18181b
```

#### Typography
```css
/* Headings */
font-family: 'Outfit', sans-serif

/* Body */
font-family: 'Inter', sans-serif
```

---

## API Reference

### Authentication

#### POST /api/auth/register
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

// Response (201)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64a1b2c3...",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/login
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (200)
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

### Reels

#### POST /api/reels/ingest
```json
// URL Mode
{
  "type": "url",
  "url": "https://www.instagram.com/reel/..."
}

// Upload Mode (multipart/form-data)
{
  "type": "upload",
  "video": <file>
}

// Response (202)
{
  "success": true,
  "message": "Reel queued for processing",
  "reel": {
    "id": "64a1b2c3...",
    "status": "pending",
    "progress": 0
  }
}
```

#### GET /api/reels/:id
```json
// Response (200)
{
  "success": true,
  "reel": {
    "id": "64a1b2c3...",
    "status": "completed",
    "progress": 100,
    "extractedData": {
      "audioTranscript": "...",
      "ocrText": ["..."],
      "rawEntities": { ... }
    },
    "extractedPlaces": [
      {
        "rawName": "Cafe Grumpy",
        "confidence": 0.92,
        "resolvedPlace": { ... }
      }
    ]
  }
}
```

### Places

#### GET /api/places
```
Query Parameters:
- lat: number (latitude)
- lng: number (longitude)
- radius: number (meters, default 5000)
- category: string (cafe, restaurant, etc.)
- savedOnly: boolean

Response (200):
{
  "success": true,
  "count": 15,
  "places": [
    {
      "id": "64a1b2c3...",
      "name": "Cafe Grumpy",
      "address": "193 Meserole Ave, Brooklyn, NY",
      "location": {
        "type": "Point",
        "coordinates": [-73.9496, 40.7267]
      },
      "distance": 1200,
      "rating": 4.5,
      "specialties": ["matcha latte", "croissants"],
      "category": "cafe"
    }
  ]
}
```

### Itineraries

#### POST /api/itineraries
```json
// Request
{
  "name": "Weekend Coffee Tour",
  "description": "Best cafes in Brooklyn",
  "places": [
    {
      "placeId": "64a1b2c3...",
      "order": 1,
      "notes": "Try the espresso"
    }
  ],
  "isPublic": false
}

// Response (201)
{
  "success": true,
  "itinerary": { ... }
}
```

---

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed),
  name: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}

// Indexes
email: unique
location: 2dsphere
```

### Reel Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  sourceUrl: String,
  videoPath: String,
  status: "pending" | "processing" | "completed" | "failed",
  processingProgress: Number (0-100),
  extractedData: {
    audioTranscript: String,
    ocrText: [String],
    rawEntities: Object
  },
  error: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
user + createdAt: compound
status: single
```

### Place Collection
```javascript
{
  _id: ObjectId,
  name: String,
  address: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  placeId: String (unique, Google Place ID),
  rating: Number,
  specialties: [String],
  category: "cafe" | "restaurant" | "bar" | "bakery" | "other",
  photos: [String],
  externalData: Object,
  savedBy: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}

// Indexes
placeId: unique
location: 2dsphere
savedBy: multi-key
category: single
```

### ExtractedPlace Collection
```javascript
{
  _id: ObjectId,
  reel: ObjectId (ref: Reel),
  rawName: String,
  rawAddress: String,
  confidence: Number (0-1),
  resolvedPlace: ObjectId (ref: Place),
  needsReview: Boolean,
  createdAt: Date
}

// Indexes
reel: single
confidence: single
needsReview: single
```

### Itinerary Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  name: String,
  description: String,
  places: [{
    place: ObjectId (ref: Place),
    order: Number,
    notes: String
  }],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
user + createdAt: compound
```

---

## Deployment Guide

### Environment Setup

#### Production Environment Variables

**Backend (.env)**
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/reel-to-real
REDIS_HOST=redis-12345.cloud.redislabs.com
REDIS_PORT=12345
JWT_SECRET=<64-char-random-string>
OPENAI_API_KEY=sk-...
GOOGLE_PLACES_API_KEY=AIza...
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

**Worker (.env)**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/reel-to-real
REDIS_HOST=redis-12345.cloud.redislabs.com
REDIS_PORT=12345
OPENAI_API_KEY=sk-...
GOOGLE_PLACES_API_KEY=AIza...
WORKER_CONCURRENCY=2
```

**Frontend (.env)**
```bash
VITE_API_URL=https://api.reel-to-real.com/api
VITE_MAPBOX_TOKEN=pk.ey...
```

### Deployment Platforms

#### Frontend (Vercel)
```bash
# 1. Connect GitHub repository to Vercel
# 2. Configure build settings
Build Command: npm run build
Output Directory: dist
Root Directory: frontend

# 3. Add environment variables in Vercel dashboard
VITE_API_URL
VITE_MAPBOX_TOKEN

# 4. Deploy
vercel deploy --prod
```

#### Backend (Render)
```yaml
# render.yaml
services:
  - type: web
    name: reel-to-real-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    rootDir: backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: REDIS_HOST
        sync: false
      # ... other env vars
```

#### Worker (Render)
```yaml
services:
  - type: worker
    name: reel-to-real-worker
    env: node
    buildCommand: npm install
    startCommand: npm start
    rootDir: worker
    envVars:
      - key: NODE_ENV
        value: production
      # ... other env vars
```

### Database Setup

#### MongoDB Atlas
```bash
# 1. Create cluster (M0 free tier for MVP)
# 2. Create database user
# 3. Whitelist IP addresses (0.0.0.0/0 for development)
# 4. Get connection string
mongodb+srv://username:password@cluster.mongodb.net/reel-to-real

# 5. Create indexes (automatic via Mongoose)
```

#### Redis Cloud
```bash
# 1. Create database (30MB free tier)
# 2. Get connection details
# 3. Update REDIS_HOST and REDIS_PORT in env vars
```

---

## Performance Optimization

### Backend
- **Connection Pooling**: MongoDB connection pool (default 100)
- **Caching**: Redis for frequently accessed places
- **Indexing**: 2dsphere for geospatial, compound for queries
- **Pagination**: Limit results to 100 per request

### Worker
- **Concurrency**: 2 videos processed simultaneously
- **Cleanup**: Temporary files deleted after processing
- **Rate Limiting**: Max 10 jobs per minute
- **Batch OCR**: Process frames in batches of 5

### Frontend
- **Code Splitting**: React.lazy for route-based splitting
- **Image Optimization**: WebP format for photos
- **Debouncing**: Search input debounced (300ms)
- **Memoization**: React.memo for expensive components

---

## Security Considerations

### Authentication
- ✅ JWT tokens with 7-day expiry
- ✅ bcrypt password hashing (10 rounds)
- ✅ HTTPS only in production
- ✅ CORS configured for frontend domain

### Input Validation
- ✅ express-validator for all inputs
- ✅ File type validation (video only)
- ✅ File size limits (100MB)
- ✅ SQL injection prevention (Mongoose escaping)

### API Security
- ✅ Rate limiting (10 req/min for workers)
- ✅ Error messages don't leak internals
- ✅ Stack traces only in development
- ✅ API keys in environment variables

---

## Known Limitations (MVP)

1. **Processing Time**: 30-60 seconds per Reel
2. **Accuracy**: ~70-80% on clear videos, lower on ambiguous content
3. **Language**: English only
4. **Instagram Changes**: May break if Instagram changes video structure
5. **API Costs**: ~$0.10-0.20 per video (Whisper + GPT-4)
6. **No Real-Time**: Worker queue means delay between submission and results
7. **URL Download**: Not implemented in MVP (upload only)

---

## Future Enhancements

### Phase 2 Features
- [ ] Proximity notifications (geofencing)
- [ ] Smart itinerary optimization (TSP algorithm)
- [ ] Social features (share lists, follow users)
- [ ] Booking integrations (OpenTable, Resy)
- [ ] Multi-language support
- [ ] Mobile apps (React Native)

### Technical Improvements
- [ ] Redis caching layer
- [ ] CDN for video storage
- [ ] Batch processing (multiple Reels)
- [ ] Custom NER model (fine-tuned)
- [ ] WebSocket real-time updates

---

## Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check MongoDB is running
mongod --version
# Check connection string format
mongodb://localhost:27017/reel-to-real
```

**Redis Connection Error**
```bash
# Check Redis is running
redis-cli ping
# Should return: PONG
```

**Worker Not Processing Jobs**
```bash
# Check worker logs
cd worker && npm run dev
# Check Redis queue
redis-cli
> KEYS *
```

**API 401 Unauthorized**
```bash
# Check JWT token in localStorage
localStorage.getItem('token')
# Check token expiry (7 days)
```

---

## Support & Contributing

### Getting Help
- GitHub Issues: Report bugs and feature requests
- Documentation: Check this guide first
- Email: support@reel-to-real.com

### Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

MIT License - see LICENSE file for details

---

**Built with ❤️ for discovering hidden gems**
