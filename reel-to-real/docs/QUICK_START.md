# Reel-to-Real: Quick Start Guide

## 🚀 Get Up and Running in 10 Minutes

This guide will help you set up and run the Reel-to-Real application locally.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (v7 or higher) - [Download](https://redis.io/download)
- **ffmpeg** - [Download](https://ffmpeg.org/download.html)

### API Keys Required

You'll need to sign up for these free services:

1. **OpenAI API** - [Get API Key](https://platform.openai.com/api-keys)
   - Used for Whisper (audio transcription) and GPT-4 (entity extraction)
   - Cost: ~$0.10-0.20 per video

2. **Google Places API** - [Get API Key](https://developers.google.com/maps/documentation/places/web-service/get-api-key)
   - Used for place resolution and details
   - Free tier: $200/month credit

3. **Mapbox** - [Get Access Token](https://account.mapbox.com/access-tokens/)
   - Used for interactive maps in frontend
   - Free tier: 50,000 map loads/month

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd reel-to-real
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install worker dependencies
cd ../worker
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Set Up Environment Variables

#### Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/reel-to-real

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT (generate a random 64-character string)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Places
GOOGLE_PLACES_API_KEY=AIza-your-google-places-api-key-here

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600
```

#### Worker Environment

```bash
cd ../worker
cp .env.example .env
```

Edit `worker/.env`:

```bash
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/reel-to-real

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# Google Places
GOOGLE_PLACES_API_KEY=AIza-your-google-places-api-key-here

# Worker Settings
WORKER_CONCURRENCY=2
```

#### Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=pk.ey-your-mapbox-token-here
```

### 4. Start MongoDB and Redis

**MongoDB:**
```bash
# macOS/Linux
mongod

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

**Redis:**
```bash
# macOS/Linux
redis-server

# Windows
redis-server.exe
```

### 5. Start the Application

Open **3 separate terminal windows**:

**Terminal 1 - Backend API:**
```bash
cd backend
npm run dev
```

You should see:
```
Server running in development mode on port 5000
MongoDB Connected: localhost
```

**Terminal 2 - Worker Service:**
```bash
cd worker
npm run dev
```

You should see:
```
Worker connected to MongoDB
Worker started and waiting for jobs...
Concurrency: 2
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Open the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Reel-to-Real landing page! 🎉

---

## Testing the Application

### 1. Create an Account

1. Click "Get Started" or "Register"
2. Fill in your details:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
3. Click "Create Account"

### 2. Upload a Test Reel

1. You'll be redirected to the Dashboard
2. Click "Upload Reel"
3. Choose "Upload File" tab
4. Select a video file (MP4, MOV, etc.)
5. Click "Upload"

### 3. Watch the Processing

The reel will go through these stages:
- **Pending** (0%)
- **Processing** (5% → 100%)
  - Extracting audio (15%)
  - Transcribing with Whisper (35%)
  - Extracting frames (45%)
  - Performing OCR (65%)
  - Extracting entities with GPT-4 (80%)
  - Resolving place with Google Places (90%)
- **Completed** (100%)

This takes about 30-60 seconds depending on video length.

### 4. View Extracted Places

1. Click "Places" in the navigation
2. You'll see places extracted from your reels
3. Toggle between Map and List view
4. Search and filter places

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solution:**
```bash
# Make sure MongoDB is running
mongod --version

# Check if MongoDB is running
ps aux | grep mongod  # macOS/Linux
tasklist | findstr mongod  # Windows
```

### Redis Connection Error

**Error:** `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Make sure Redis is running
redis-cli ping
# Should return: PONG

# If not running, start Redis
redis-server
```

### OpenAI API Error

**Error:** `401 Unauthorized` or `Invalid API key`

**Solution:**
1. Check your API key in `backend/.env` and `worker/.env`
2. Verify the key is valid: [OpenAI API Keys](https://platform.openai.com/api-keys)
3. Ensure you have credits in your OpenAI account

### Google Places API Error

**Error:** `REQUEST_DENIED`

**Solution:**
1. Enable Places API in Google Cloud Console
2. Check your API key in `backend/.env` and `worker/.env`
3. Verify billing is enabled (free tier requires billing info)

### ffmpeg Not Found

**Error:** `Error: ffmpeg not found`

**Solution:**
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
# Add to PATH
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

---

## Development Tips

### Hot Reload

All services support hot reload:
- **Backend**: Nodemon restarts on file changes
- **Worker**: Nodemon restarts on file changes
- **Frontend**: Vite HMR updates instantly

### Viewing Logs

**Backend Logs:**
```bash
cd backend
npm run dev
# Logs show HTTP requests and database operations
```

**Worker Logs:**
```bash
cd worker
npm run dev
# Logs show job processing steps and progress
```

**Frontend Logs:**
```bash
# Open browser DevTools (F12)
# Check Console tab for React errors
```

### Database Inspection

**MongoDB:**
```bash
# Connect to MongoDB shell
mongosh

# Use the database
use reel-to-real

# View collections
show collections

# Query users
db.users.find()

# Query places
db.places.find()
```

**Redis:**
```bash
# Connect to Redis CLI
redis-cli

# View all keys
KEYS *

# View queue jobs
LRANGE bull:reel-processing:wait 0 -1
```

---

## Next Steps

### Add Sample Data

Create a few test reels to populate your database:

1. Find short videos (15-30 seconds) about cafes/restaurants
2. Upload them through the Dashboard
3. Wait for processing to complete
4. Explore the Places page

### Customize the App

- **Colors**: Edit `frontend/tailwind.config.js`
- **Fonts**: Update Google Fonts in `frontend/index.html`
- **API Endpoints**: Modify `backend/routes/*.js`
- **Worker Logic**: Adjust `worker/worker.js`

### Deploy to Production

See `docs/PROJECT_DOCUMENTATION.md` for deployment instructions:
- Frontend → Vercel
- Backend → Render
- Worker → Render
- Database → MongoDB Atlas
- Redis → Redis Cloud

---

## Useful Commands

### Start All Services (Concurrently)

From the root directory:
```bash
npm run dev
```

This starts backend, worker, and frontend simultaneously.

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend (no build needed, just run)
cd backend
npm start

# Worker (no build needed, just run)
cd worker
npm start
```

### Run Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## Getting Help

- **Documentation**: See `docs/PROJECT_DOCUMENTATION.md`
- **File Explanations**: See `docs/FILE_EXPLANATIONS.md`
- **Technical Decisions**: See `docs/technical_decisions.md`
- **GitHub Issues**: Report bugs and request features

---

## Success Checklist

✅ MongoDB running on port 27017  
✅ Redis running on port 6379  
✅ Backend API running on port 5000  
✅ Worker service running  
✅ Frontend running on port 5173  
✅ Can create account and login  
✅ Can upload a reel  
✅ Reel processes successfully  
✅ Places appear on Places page  

If all checkboxes are ticked, you're ready to go! 🚀

---

**Happy discovering! 🗺️✨**
