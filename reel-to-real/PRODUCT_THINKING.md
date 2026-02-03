# Reel-to-Real: Product Thinking Document

## Executive Summary

**Problem:** Social media users save hundreds of Instagram Reels featuring restaurants, cafes, and travel spots, but this content remains trapped in video format—unsearchable, unorganized, and ultimately forgotten. When users want to actually visit these places, they face friction: scrolling through endless saved Reels, rewatching videos to extract location names, and manually searching on Google Maps.

**Solution:** Reel-to-Real is an automated lifestyle curator that transforms saved Instagram Reels into a searchable, map-integrated database of real-world venues, enabling users to rediscover, filter, and visit the places they've been inspired by.

---

## 1. User Personas

### Persona 1: The College Explorer 🎓

**Demographics:**
- Age: 18-24
- College student with limited budget
- Lives in/near urban areas, uses public transport
- Highly tech-savvy, mobile-first user

**Behavioral Traits:**
- Saves 5-10 Reels per week featuring budget cafes, date spots, and weekend getaway destinations (2-3 day trips)
- Travels in large friend groups (8-10 people) where coordination is chaotic
- Flexible with time—willing to travel at night or on short notice
- Relies on word-of-mouth from seniors who've visited places before

**Pain Points:**
- **Memory Loss:** "I saved that cafe Reel 2 months ago, but which one was it?"
- **Group Coordination:** No one takes initiative to plan because saved Reels are scattered across individual accounts
- **Budget Constraints:** Needs to filter by price range but can't search saved Reels

**Jobs to Be Done:**
- Quickly find budget-friendly spots for spontaneous weekend plans
- Share curated lists with friends to enable collaborative trip planning
- Discover places seniors/peers have visited and validated

**Success Looks Like:**
- Uses the app weekly to plan weekend outings
- Visits 20-30% of saved places within 3 months
- Shares saved lists with friend groups

---

### Persona 2: The Busy Professional 💼

**Demographics:**
- Age: 25-35
- Working 9-5 corporate job with disposable income
- Limited free time (weekends only)
- Small, close-knit friend group (3-4 people)

**Behavioral Traits:**
- Saves Reels during commute or late-night scrolling
- Focuses on date night restaurants, brunch spots, weekend bars, and city exploration
- Values efficiency—wants instant results without manual research
- Willing to spend money for quality experiences

**Pain Points:**
- **Time Scarcity:** "I have 2 hours on Saturday morning—where should I go?"
- **Planning Friction:** No time to manually extract location names from 50+ saved Reels
- **Decision Fatigue:** Needs curated, distance-sorted recommendations, not endless scrolling

**Jobs to Be Done:**
- Find "near me" spots instantly on Saturday mornings
- Plan date nights or friend hangouts without research overhead
- Explore new cities during work trips with pre-saved local gems

**Success Looks Like:**
- Opens the app every weekend to find nearby spots
- Visits 1-2 saved places per month
- Reduces decision time from 30 minutes to 2 minutes

---

### Persona 3: The Travel Planner ✈️

**Demographics:**
- Age: 22-30
- Travel enthusiast who plans trips months in advance
- Saves Reels by destination (Goa, Jaipur, Paris, Bali, etc.)
- Moderate to high budget, values unique experiences

**Behavioral Traits:**
- Saves 10-15 Reels per week across multiple cities/countries
- Creates mental "bucket lists" for future trips
- Frustrated by inability to filter saved Reels by city

**Pain Points:**
- **City-Based Search:** "I'm going to Bangalore next month—which of my 200 saved Reels are in Bangalore?"
- **Itinerary Building:** Can't visualize saved spots on a map to plan efficient routes
- **Context Loss:** Forgets why they saved a Reel (was it for the food, ambiance, or view?)

**Jobs to Be Done:**
- Filter saved Reels by city when planning a trip
- Visualize all saved spots in a destination on a map
- Build day-wise itineraries from saved locations

**Success Looks Like:**
- Uses the app before every trip to extract city-specific spots
- Visits 40-50% of saved places during trips
- Shares curated city guides with travel companions

---

## 2. Core User Problems & Constraints

### Primary Problems

| Problem | Description | Impact |
|---------|-------------|--------|
| **Discovery ≠ Action** | Users save Reels with intent to visit but never follow through due to friction | 90% of saved Reels are never acted upon |
| **Memory Loss** | After saving 50+ Reels, users forget what they saved and why | Endless scrolling to rediscover content |
| **No Search/Filter** | Instagram doesn't allow searching saved Reels by location, city, or category | Manual rewatching of videos to find specific places |
| **Planning Friction** | Extracting location names, addresses, and context from videos is time-consuming | 15-30 minutes to plan a single outing |
| **Closed Platform** | Instagram doesn't provide API access to saved Reels or video metadata | Users must manually share Reel URLs |

### Key Constraints

#### 1. **Instagram is a Closed Platform**
- **Constraint:** No API access to auto-sync saved Reels
- **MVP Approach:** Users manually share Reel URLs via Instagram's native share button
- **Trade-off:** Adds one extra step but ensures compliance with Instagram's policies
- **Future Vision:** Browser extension to auto-detect and sync saved Reels

#### 2. **AI Transcription Isn't Perfect**
- **Constraint:** Whisper may mishear "Vienna Cafe" as "Sienna Cafe" or miss location names entirely
- **MVP Approach:** 
  - Use Google Maps API to validate extracted location names
  - Show confidence scores to users
  - Allow manual editing of extracted data
- **Trade-off:** 80-85% accuracy is acceptable if users can quickly correct errors

#### 3. **Not All Reels Contain Locations**
- **Constraint:** Some Reels are aesthetic shots with music, no voiceover or text
- **MVP Approach:** 
  - Mark Reels as "Location Not Found" and store them separately
  - Use OCR to extract text overlays from video frames
  - Allow users to manually tag locations
- **Trade-off:** Focus on Reels with clear audio/text mentions; handle edge cases in V2

---

## 3. End-to-End User Journey

### Scenario: College Student Discovers a Cafe Reel

#### **Step 1: Discovery (Instagram)**
- User scrolls Instagram and sees a Reel about "Hidden Cafe in Vienna with ₹200 coffee"
- Saves the Reel to their Instagram saved folder

#### **Step 2: Ingestion (Reel-to-Real)**
- User opens the saved Reel → Taps Instagram's **Share** button → Selects **"Copy Link"**
- Opens Reel-to-Real web app → Pastes URL into input field → Clicks **"Add to My List"**

#### **Step 3: Processing (Background)**
- System downloads video metadata
- Whisper transcribes audio: *"This hidden gem in Vienna serves the best cold brew..."*
- GPT-4 extracts: `{ name: "Vienna Cafe", city: "Vienna", specialty: "cold brew coffee", price: "₹200" }`
- Google Maps API validates location and fetches: address, ratings, coordinates

#### **Step 4: Storage (Database)**
- Venue data saved to MongoDB with:
  - Location name, address, coordinates
  - Specialty mentioned in Reel
  - Original Reel URL for reference
  - Timestamp of when it was saved

#### **Step 5: Rediscovery (User Returns)**
- **Weekend Morning:** User opens Reel-to-Real
- Sees **List View** with all saved cafes
- Switches to **Map View** → Filters "Within 5km" → Sees Vienna Cafe is 3km away
- Clicks on cafe → Sees specialty ("cold brew"), ratings (4.5★), and original Reel
- Taps **"Get Directions"** → Opens Google Maps

#### **Step 6: Real-World Visit**
- User visits Vienna Cafe with friends
- (Future feature: App sends notification when user is within 500m of a saved spot)

---

## 4. Success Metrics

### North Star Metric
**Saved-to-Visited Conversion Rate:** % of saved Reels that result in a real-world visit within 3 months

### Primary Metrics

| Metric | Definition | Target (6 months) |
|--------|------------|-------------------|
| **Weekly Active Users (WAU)** | Users who add or view saved spots weekly | 1,000 WAU |
| **Reels Processed** | Total Reels successfully converted to venue data | 10,000 Reels |
| **Avg. Reels per User** | Number of Reels saved per active user | 15-20 Reels |
| **Extraction Accuracy** | % of Reels with correctly identified locations | 80%+ |
| **Saved-to-Visited Rate** | % of users who report visiting a saved spot | 25-30% |

### Engagement Metrics
- **Session Frequency:** Users open app 2-3x per month (weekend planning)
- **Map View Usage:** 60% of users switch to map view within first session
- **Search/Filter Usage:** 40% of users filter by distance or category

### Retention Metrics
- **D7 Retention:** 40% (users return within 7 days to add more Reels)
- **M1 Retention:** 25% (users return after 30 days to plan outings)

---

## 5. Key Assumptions & Logical Guestimates

### Behavioral Assumptions

| Assumption | Rationale | Risk if Wrong |
|------------|-----------|---------------|
| Users save 5-10 Reels/week | Based on typical Instagram power user behavior | If users save <3/week, product has low utility |
| 70% of Reels mention location names | Most food/travel Reels include voiceover or text overlay | If <50%, extraction accuracy drops significantly |
| Users will manually share URLs | Acceptable friction for MVP | If users find it too tedious, adoption suffers |
| Users trust AI-extracted data | If accuracy is 80%+, users will validate and use it | If <70%, users lose trust and abandon app |

### Market Guestimates

**Target User Base (India):**
- Instagram users in India: ~250M
- Users who save Reels regularly: ~25M (10%)
- Users who save food/travel Reels: ~10M (4%)
- **Addressable Market:** 10M users

**Engagement Estimates:**
- Avg. saved Reels per user: 50-100
- Reels with identifiable locations: 70%
- Time to process one Reel: 30-60 seconds
- User session length: 5-10 minutes (browsing saved spots)

**Conversion Estimates:**
- Users who visit saved spots: 25-30%
- Avg. visits per user per month: 1-2
- Repeat usage: Users return every 2-3 weeks

### Technical Assumptions

| Component | Assumption | Validation Plan |
|-----------|------------|-----------------|
| **Whisper API** | Can transcribe Instagram Reels with 80%+ accuracy | Test with 100 sample Reels |
| **Google Maps API** | Can validate and enrich 90% of extracted location names | Cross-check with manual validation |
| **Processing Time** | 30-60 seconds per Reel is acceptable to users | User testing with 5-10 beta users |
| **Storage Costs** | MongoDB can handle 100K Reels at <$50/month | Monitor database size in production |

---

## 6. MVP Scope & Trade-offs

### In Scope (MVP)
✅ Manual URL ingestion (share-to-app)  
✅ Audio transcription (Whisper)  
✅ Location extraction (GPT-4)  
✅ Map integration (Google Maps API)  
✅ List + Map view  
✅ Distance-based filtering  
✅ Basic search (by name/city)  

### Out of Scope (Post-MVP)
❌ Auto-sync saved Reels (requires browser extension)  
❌ Collaborative lists (share with friends)  
❌ Proximity notifications ("You're near a saved spot!")  
❌ Itinerary builder (day-wise trip planning)  
❌ User reviews/ratings  
❌ Social features (follow friends, see their lists)  

### Key Trade-offs

| Decision | Trade-off | Rationale |
|----------|-----------|-----------|
| Manual URL sharing | Adds friction but ensures compliance | Instagram's closed API leaves no alternative for MVP |
| 80% extraction accuracy | Some Reels will have errors | Users can manually edit; perfect accuracy isn't critical for MVP |
| Web-first (no mobile app) | Limits on-the-go usage | Faster to build and test; mobile app in V2 |
| No social features | Reduces viral growth | Focus on core value prop first; social layer in V2 |

---

## 7. Future Vision

### Phase 2: Automation & Intelligence
- **Browser Extension:** Auto-sync saved Reels without manual URL sharing
- **Smart Notifications:** "You're 500m from Vienna Cafe—want to visit?"
- **Itinerary Builder:** "Plan a Saturday in South Delhi with 3 saved spots"

### Phase 3: Social & Collaboration
- **Shared Lists:** Collaborate with friends on group trip plans
- **Public Guides:** "Top 10 Cafes in Bangalore (curated from Reels)"
- **Follow Feature:** See what places your friends have saved

### Phase 4: Monetization
- **Premium Features:** Unlimited Reels, advanced filters, offline maps
- **Affiliate Partnerships:** Earn commission on bookings via Zomato/Google Maps
- **Sponsored Listings:** Restaurants pay to appear in "Near Me" results

---

## Conclusion

Reel-to-Real bridges the gap between **social media discovery** and **real-world action** by solving a clear pain point: saved Reels are forgotten and unsearchable. By focusing on automation, map integration, and distance-based filtering, the MVP delivers immediate value to college students, busy professionals, and travel planners—three personas who collectively represent millions of potential users.

The product's success hinges on **extraction accuracy** (80%+), **user trust** in AI-generated data, and **low friction** in the ingestion process. With disciplined MVP scoping and a clear roadmap to automation and social features, Reel-to-Real has the potential to become the default tool for turning Instagram inspiration into real-world experiences.
