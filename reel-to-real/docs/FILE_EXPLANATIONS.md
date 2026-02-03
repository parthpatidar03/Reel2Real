# Reel-to-Real: File-by-File Explanation

This document explains every file in the project, its purpose, and how it interacts with other components.

---

## Backend Files

### `/backend/server.js`
**Purpose**: Main Express application entry point

**What it does**:
- Initializes Express app
- Connects to MongoDB
- Registers middleware (CORS, JSON parsing, logging)
- Mounts API routes
- Starts HTTP server on port 5000

**Interactions**:
- Imports routes from `/routes/*`
- Uses middleware from `/middleware/*`
- Connects to database via `/config/database.js`

---

### `/backend/config/database.js`
**Purpose**: MongoDB connection configuration

**What it does**:
- Exports `connectDB()` function
- Uses Mongoose to connect to MongoDB
- Handles connection errors
- Logs successful connection

**Why this approach**:
- Centralized database logic
- Easy to swap database in future
- Connection pooling handled by Mongoose

---

### `/backend/config/queue.js`
**Purpose**: BullMQ queue setup and job management

**What it does**:
- Creates Redis connection
- Initializes `reel-processing` queue
- Exports `addJobToQueue()` function
- Configures retry strategy (3 attempts, exponential backoff)

**Why BullMQ**:
- Redis-backed (fast, reliable)
- Built-in retry logic
- Progress tracking
- Better than RabbitMQ for this use case (simpler, lighter)

**Interactions**:
- Used by `reelController.js` to queue jobs
- Worker connects to same queue

---

### `/backend/config/upload.js`
**Purpose**: Multer configuration for video uploads

**What it does**:
- Configures disk storage (saves to `/uploads`)
- Generates unique filenames (timestamp + random)
- Validates file types (video only)
- Sets size limit (100MB)

**Why Multer**:
- Standard Express middleware for file uploads
- Handles multipart/form-data
- Built-in validation

---

### `/backend/models/User.js`
**Purpose**: User schema and authentication methods

**Schema**:
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  location: GeoJSON Point
}
```

**Methods**:
- `comparePassword()`: Verify login password
- `toPublicJSON()`: Return user without password

**Pre-save Hook**:
- Hashes password with bcrypt (10 rounds) before saving

**Indexes**:
- `email`: Unique, for fast login lookups
- `location`: 2dsphere, for proximity queries

**Why bcrypt**:
- Industry standard for password hashing
- Slow by design (prevents brute force)
- Salted automatically

---

### `/backend/models/Reel.js`
**Purpose**: Reel processing tracking

**Schema**:
```javascript
{
  user: ObjectId,
  sourceUrl: String,
  videoPath: String,
  status: "pending" | "processing" | "completed" | "failed",
  processingProgress: Number (0-100),
  extractedData: {
    audioTranscript: String,
    ocrText: [String],
    rawEntities: Object
  },
  error: String
}
```

**Methods**:
- `updateProgress(progress, status)`: Update processing state
- `markAsFailed(error)`: Set status to failed
- `markAsCompleted()`: Set status to completed

**Indexes**:
- `user + createdAt`: Get user's reels sorted by date
- `status`: Filter by processing status

---

### `/backend/models/Place.js`
**Purpose**: Venue/place data with geospatial support

**Schema**:
```javascript
{
  name: String,
  address: String,
  location: GeoJSON Point,
  placeId: String (Google Place ID),
  rating: Number,
  specialties: [String],
  category: String,
  savedBy: [ObjectId]
}
```

**Methods**:
- `distanceFrom(lng, lat)`: Calculate distance using Haversine formula
- `saveByUser(userId)`: Add user to savedBy array
- `unsaveByUser(userId)`: Remove user from savedBy

**Indexes**:
- `placeId`: Unique, prevent duplicates
- `location`: 2dsphere, for `$near` queries
- `savedBy`: Multi-key, for user's saved places

**Why GeoJSON**:
- MongoDB native support
- Efficient spatial queries
- Standard format (portable)

---

### `/backend/models/ExtractedPlace.js`
**Purpose**: Track extraction attempts and confidence

**Schema**:
```javascript
{
  reel: ObjectId,
  rawName: String,
  rawAddress: String,
  confidence: Number (0-1),
  resolvedPlace: ObjectId,
  needsReview: Boolean
}
```

**Pre-save Hook**:
- Automatically sets `needsReview = true` if confidence < 0.5

**Why separate from Place**:
- Tracks extraction history
- Allows multiple extraction attempts
- Can improve ML model later with this data

---

### `/backend/models/Itinerary.js`
**Purpose**: User-created lists of places

**Schema**:
```javascript
{
  user: ObjectId,
  name: String,
  description: String,
  places: [{
    place: ObjectId,
    order: Number,
    notes: String
  }],
  isPublic: Boolean
}
```

**Methods**:
- `addPlace(placeId, notes)`: Append place to end
- `removePlace(placeId)`: Remove and reorder
- `reorderPlaces(placeOrders)`: Update order numbers

**Why embedded places array**:
- Always accessed together
- Order is important (can't use separate collection)
- Small array size (< 100 places typically)

---

### `/backend/controllers/authController.js`
**Purpose**: Authentication business logic

**Endpoints**:
1. `register()`: Create user, hash password, return JWT
2. `login()`: Verify credentials, return JWT
3. `getMe()`: Get current user (requires auth)
4. `updateLocation()`: Update user's GeoJSON location

**Why JWT**:
- Stateless (no session storage needed)
- Scalable (works across multiple servers)
- Mobile-friendly

**Token Expiry**: 7 days (balance between UX and security)

---

### `/backend/controllers/reelController.js`
**Purpose**: Reel ingestion and status tracking

**Endpoints**:
1. `ingestReel()`: Accept URL or file, queue job
2. `getReelStatus()`: Get processing progress
3. `getUserReels()`: List user's reels
4. `deleteReel()`: Delete reel and video file

**Flow**:
```
User uploads video
→ Save to /uploads
→ Create Reel document (status: pending)
→ Add job to BullMQ queue
→ Return 202 Accepted with reel ID
→ User polls /reels/:id for status
```

**Why async**:
- Video processing takes 30-60 seconds
- Can't block HTTP request (timeout)
- Better UX (immediate response)

---

### `/backend/controllers/placeController.js`
**Purpose**: Place CRUD and geospatial queries

**Endpoints**:
1. `getPlaces()`: Geospatial query with filters
2. `getPlace()`: Single place details
3. `savePlace()`: Add to user's saved places
4. `unsavePlace()`: Remove from saved places
5. `searchPlaces()`: Text search

**Geospatial Query**:
```javascript
Place.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [lng, lat] },
      $maxDistance: 5000 // meters
    }
  }
})
```

**Why $near**:
- Returns results sorted by distance
- Uses 2dsphere index (fast)
- Supports radius filtering

---

### `/backend/controllers/itineraryController.js`
**Purpose**: Itinerary CRUD operations

**Endpoints**:
1. `createItinerary()`: Create new itinerary
2. `getUserItineraries()`: List user's itineraries
3. `getItinerary()`: Single itinerary (with populated places)
4. `updateItinerary()`: Update name/description
5. `deleteItinerary()`: Delete itinerary
6. `addPlaceToItinerary()`: Add place
7. `removePlaceFromItinerary()`: Remove place
8. `reorderPlaces()`: Change order

**Why separate add/remove endpoints**:
- RESTful design
- Easier to validate
- Clear intent

---

### `/backend/middleware/auth.js`
**Purpose**: JWT token verification

**How it works**:
1. Extract token from `Authorization: Bearer <token>` header
2. Verify token with `jwt.verify()`
3. Get user from database
4. Attach user to `req.user`
5. Call `next()`

**Error cases**:
- No token: 401 Unauthorized
- Invalid token: 401 Unauthorized
- User not found: 401 Unauthorized

**Why middleware**:
- DRY (don't repeat in every controller)
- Centralized auth logic
- Easy to add to routes

---

### `/backend/middleware/errorHandler.js`
**Purpose**: Global error handling

**What it does**:
- Catches all errors from routes/controllers
- Formats error response consistently
- Handles Mongoose errors (CastError, ValidationError)
- Handles JWT errors
- Logs errors for debugging

**Error Response Format**:
```json
{
  "error": {
    "message": "User-friendly message",
    "code": "ERROR_CODE",
    "stack": "..." // Only in development
  }
}
```

**Why centralized**:
- Consistent error format
- Don't leak internals to client
- Easy to add logging/monitoring

---

### `/backend/middleware/validate.js`
**Purpose**: Input validation with express-validator

**How it works**:
1. Routes define validation rules
2. This middleware checks results
3. If errors, return 400 with details
4. If valid, call `next()`

**Example**:
```javascript
router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
    validate // This middleware
  ],
  authController.login
);
```

**Why express-validator**:
- Declarative validation
- 100+ built-in validators
- Good error messages

---

## Worker Files

### `/worker/worker.js`
**Purpose**: Main worker process

**What it does**:
- Connects to MongoDB and Redis
- Creates BullMQ Worker
- Processes `PROCESS_REEL` jobs
- Handles errors and retries
- Cleans up temporary files

**Job Processing Flow**:
```
1. Extract audio (ffmpeg)
2. Transcribe audio (Whisper)
3. Extract frames (ffmpeg)
4. Perform OCR (Tesseract)
5. Extract entities (GPT-4)
6. Resolve place (Google Places)
7. Calculate confidence
8. Save to database
9. Cleanup files
```

**Concurrency**: 2 (process 2 videos simultaneously)

**Why separate process**:
- Isolate heavy processing from API
- Can scale independently
- Restart without affecting API

---

### `/worker/utils/videoProcessor.js`
**Purpose**: Video/audio extraction with ffmpeg

**Functions**:
1. `extractAudio(videoPath)`: Extract MP3 from video
2. `extractFrames(videoPath, fps)`: Extract JPG frames
3. `downloadVideo(url)`: Placeholder for URL download

**Why ffmpeg**:
- Industry standard
- Supports all video formats
- Fast and reliable

**Frame Extraction**:
- 1 frame per second (balance between quality and speed)
- JPG format (smaller than PNG)
- Quality setting: 2 (high quality)

---

### `/worker/utils/aiProcessor.js`
**Purpose**: AI processing with OpenAI

**Functions**:
1. `transcribeAudio(audioPath)`: Whisper transcription
2. `extractEntities(transcript, ocrTexts)`: GPT-4 entity extraction

**Whisper Settings**:
- Model: `whisper-1`
- Language: `en`
- Format: `text`

**GPT-4 Prompt**:
```
You are a venue extraction specialist.
Extract: name, address, city, specialties, category
Return JSON only.
```

**Why GPT-4**:
- Handles informal language ("that place on Bedford")
- Context understanding
- Structured output (JSON mode)

**Cost**: ~$0.01-0.02 per video

---

### `/worker/utils/ocrProcessor.js`
**Purpose**: OCR with Tesseract.js

**Functions**:
1. `performOCR(framePaths)`: Extract text from frames
2. `cleanOCRResults(ocrTexts)`: Deduplicate and filter

**Batch Processing**:
- Process 5 frames at a time (avoid memory issues)
- Only include text with confidence > 60%
- Filter out very short texts (< 3 chars)

**Why Tesseract**:
- Free and open-source
- Good accuracy on clear text
- JavaScript implementation (no Python needed)

---

### `/worker/utils/placeResolver.js`
**Purpose**: Google Places API integration

**Functions**:
1. `resolvePlace(extractedData)`: Search and match
2. `calculateConfidence(extracted, apiMatch)`: Score algorithm
3. `getPlaceDetails(placeId)`: Get full details

**Confidence Algorithm**:
```
confidence = (0.5 × nameSimilarity) + 
             (0.3 × addressSimilarity) + 
             (0.2 × verificationSignals)
```

**Why weighted**:
- Name is most important (50%)
- Address confirms location (30%)
- Verification adds trust (20%)

**String Similarity**:
- Uses Levenshtein distance
- Handles typos and variations
- "Cafe Grumpy" vs "Café Grumpy" = 0.95

---

## Frontend Files

### `/frontend/src/main.jsx`
**Purpose**: React app entry point

**What it does**:
- Renders React app to DOM
- Wraps with BrowserRouter
- Adds Toaster for notifications

**Why React.StrictMode**:
- Highlights potential problems
- Checks for deprecated APIs
- Only in development

---

### `/frontend/src/App.jsx`
**Purpose**: Main app component with routing

**Routes**:
- `/` → Landing (public)
- `/login` → Login (public)
- `/register` → Register (public)
- `/dashboard` → Dashboard (protected)
- `/places` → Places (protected)
- `/itineraries` → Itineraries (protected)

**ProtectedRoute**:
- Checks `isAuthenticated` from store
- Redirects to `/login` if not authenticated

**Why React Router**:
- Client-side routing (no page reload)
- Nested routes support
- Easy to protect routes

---

### `/frontend/src/services/api.js`
**Purpose**: Axios HTTP client and API methods

**Features**:
- Base URL from environment variable
- Auto-attach JWT token to requests
- Auto-redirect to login on 401
- Organized by resource (auth, reels, places, itineraries)

**Interceptors**:
```javascript
// Request: Add token
config.headers.Authorization = `Bearer ${token}`

// Response: Handle 401
if (status === 401) redirect to /login
```

**Why axios**:
- Better than fetch (interceptors, auto JSON)
- Request/response transformation
- Cancel requests

---

### `/frontend/src/stores/authStore.js`
**Purpose**: Authentication state management

**State**:
- `user`: Current user object
- `token`: JWT token
- `isAuthenticated`: Boolean
- `isLoading`: Loading state
- `error`: Error message

**Actions**:
- `login(email, password)`
- `register(email, password, name)`
- `logout()`
- `fetchUser()`
- `updateLocation(lng, lat)`

**Why Zustand**:
- Simpler than Redux (1/10th the code)
- No Context API (better performance)
- TypeScript support
- 1KB size

---

### `/frontend/src/stores/placesStore.js`
**Purpose**: Places state management

**State**:
- `places`: Array of places
- `selectedPlace`: Currently selected place
- `viewMode`: 'map' or 'list'
- `filters`: { category, savedOnly, radius }

**Actions**:
- `fetchPlaces(lat, lng)`
- `savePlace(placeId)`
- `unsavePlace(placeId)`
- `searchPlaces(query)`
- `toggleView()`

**Why separate store**:
- Keep auth and places logic separate
- Easier to test
- Clear responsibilities

---

### `/frontend/tailwind.config.js`
**Purpose**: Tailwind CSS configuration

**Custom Colors**:
- Primary: Coral/peach gradient (#ff6b4a)
- Accent: Teal (#14b8a6)
- Neutrals: Gray scale

**Custom Fonts**:
- Headings: Outfit (bold, modern)
- Body: Inter (readable, professional)

**Custom Animations**:
- fade-in
- slide-up
- scale-in

**Why Tailwind**:
- Rapid development
- Consistent design tokens
- Purges unused CSS (small bundle)

---

### `/frontend/vite.config.js`
**Purpose**: Vite build configuration

**Features**:
- React plugin
- Dev server on port 5173
- Proxy `/api` to backend (avoid CORS in dev)

**Why Vite**:
- Instant HMR (<50ms)
- ES modules (no bundling in dev)
- Fast production builds

---

## Configuration Files

### `/docker-compose.yml`
**Purpose**: Local development with Docker

**Services**:
- `mongodb`: MongoDB 6
- `redis`: Redis 7
- `backend`: Express API
- `worker`: BullMQ worker
- `frontend`: React dev server

**Volumes**:
- `mongo-data`: Persist database
- `uploads`: Share uploads between services

**Why Docker Compose**:
- One command to start all services
- Consistent environment
- Easy for new developers

---

### `/.gitignore`
**Purpose**: Exclude files from Git

**Excluded**:
- `node_modules/`
- `.env` files
- `uploads/` (videos)
- Build outputs (`dist/`, `build/`)

**Why**:
- Don't commit dependencies (large)
- Don't commit secrets (.env)
- Don't commit user uploads

---

## Summary

This project follows a **clean architecture** with clear separation of concerns:

1. **Backend**: RESTful API with MVC pattern
2. **Worker**: Isolated processing with queue
3. **Frontend**: Component-based UI with state management
4. **Database**: Document-oriented with geospatial support

Each file has a **single responsibility** and **clear interactions** with other components.
