# Reel-to-Real

Transform Instagram Reels into searchable, real-world places using AI.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- ffmpeg

### Installation

**Option 1: Automated (Windows)**
```bash
install.bat
```

**Option 2: Manual**
```bash
# Backend
cd backend
npm install

# Worker
cd ../worker
npm install

# Frontend
cd ../frontend
npm install
```

### Environment Setup

1. **Backend** - Copy `backend/.env.example` to `backend/.env`
2. **Worker** - Copy `worker/.env.example` to `worker/.env`
3. **Frontend** - Copy `frontend/.env.example` to `frontend/.env`

Add your API keys:
- `OPENAI_API_KEY` - [Get here](https://platform.openai.com/api-keys)
- `GOOGLE_PLACES_API_KEY` - [Get here](https://developers.google.com/maps/documentation/places/web-service/get-api-key)
- `VITE_MAPBOX_TOKEN` - [Get here](https://account.mapbox.com/access-tokens/)

### Run the Application

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Worker
cd worker
npm run dev

# Terminal 5: Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Detailed setup instructions
- **[Project Documentation](docs/PROJECT_DOCUMENTATION.md)** - Complete architecture & API reference
- **[File Explanations](docs/FILE_EXPLANATIONS.md)** - Every file explained
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues & solutions
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Features, costs, roadmap

## ✨ Features

- 🎥 **Smart Extraction** - AI-powered venue extraction from videos
- 🗺️ **Interactive Maps** - Mapbox integration with geospatial queries
- 🔍 **Search & Filter** - Find places by name, category, distance
- 📝 **Itineraries** - Create custom place lists
- 🔐 **Authentication** - Secure JWT-based auth
- ⚡ **Async Processing** - Queue-based worker pipeline

## 🏗️ Architecture

```
Frontend (React + Vite)
    ↓
Backend API (Express + MongoDB)
    ↓
Worker Pipeline (BullMQ + Redis)
    ↓
AI Services (Whisper + GPT-4 + Google Places)
```

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS, Zustand, Mapbox GL  
**Backend:** Express, MongoDB, Mongoose, JWT, BullMQ  
**Worker:** OpenAI Whisper, GPT-4, Tesseract.js, Google Places API  
**Infrastructure:** Redis, Docker, ffmpeg

## 📊 Processing Pipeline

1. Video Upload
2. Audio Extraction (ffmpeg)
3. Transcription (Whisper)
4. Frame Extraction (ffmpeg)
5. OCR (Tesseract)
6. Entity Extraction (GPT-4)
7. Place Resolution (Google Places)
8. Confidence Scoring
9. Database Save

**Processing Time:** 30-60 seconds per video  
**Cost:** ~$0.10-0.20 per video

## 🔐 Security

- JWT authentication with 7-day expiry
- bcrypt password hashing (10 rounds)
- Input validation on all endpoints
- File type and size validation
- CORS configuration

## 🚧 Known Limitations (MVP)

- English only
- Max 100MB file uploads
- URL download not implemented (upload only)
- Processing time: 30-60 seconds
- Accuracy: 70-80% on clear videos

## 🔮 Future Enhancements

- Instagram URL download
- WebSocket real-time updates
- Multi-language support
- Mobile apps (React Native)
- Social features
- Booking integrations

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with:
- OpenAI (Whisper & GPT-4)
- Google Places API
- Mapbox
- MongoDB
- BullMQ

---

**Built with ❤️ for discovering hidden gems from Instagram Reels**

For detailed documentation, see the `docs/` folder.
