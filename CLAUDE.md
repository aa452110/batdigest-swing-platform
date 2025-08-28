# CLAUDE.md - BatDigest Swing Analysis Coach Platform

## Current Status (Aug 27, 2025)
**WORKING:** Queue page successfully pulls pending video submissions from Cloudflare D1 database. Admin can view and analyze videos submitted from iOS app.

**NEW (Aug 27, 2025):** 
1. **Cloudflare Stream integration** for converting coach analysis videos from WebM to MP4 for iPhone compatibility
2. **Video Review Interface** with 7-day hitting plan builder after recording
3. **Production deployment** at https://swing.batdigest.com via Cloudflare Pages

## Live URLs
- **Production Site:** https://swing.batdigest.com
- **API Endpoint:** https://swing-platform.brianduryea.workers.dev
- **GitHub Repo:** https://github.com/aa452110/batdigest-swing-platform

## Purpose
**Coach-only web app** for baseball swing analysis. Coaches load videos from submission queue, annotate (lines/arrows/boxes), scrub frame-by-frame while **recording voiceover**, create 7-day hitting plans, and export the session as a video for players. **Supported environment:** Chrome on macOS.

---

## CRITICAL CONFIGURATION

### API Endpoint (FIXED Aug 27, 2025)
**IMPORTANT:** The queue page pulls video submissions from the iOS app's backend:
```
VITE_API_BASE=https://swing-platform.brianduryea.workers.dev
```
⚠️ **DO NOT USE:** `swing-analysis-api.brianduryea.workers.dev` - This endpoint has no `/api/submissions` route and will return 404.

### Admin Access
- **Routes:** 
  - `/admin/queue` - View pending video submissions
  - `/admin/analyzer` - Analyze selected video
- **Password:** `coach500admin`
- **Auth Storage:** sessionStorage (persists for browser session)

---

## Tech Stack

- **Language:** TypeScript (strict)
- **Framework:** React + Vite
- **State:** Zustand (simple stores, no boilerplate)
- **Styling:** Tailwind CSS (utility-first; minimal custom CSS)
- **Drawing:** HTML Canvas (for video annotations)
- **Media:** MediaRecorder, getUserMedia, getDisplayMedia, WebAudio
- **Backend:** Cloudflare Workers + D1 Database + R2 Storage
- **Video Storage:** Cloudflare R2 bucket `swing-videos`
- **Database:** Cloudflare D1 `swing-platform-db`

---

## Development

### Commands
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-swing-analysis-project/swing-analysis

# Install dependencies
npm install

# Start dev server (default port 5173, or specify port)
npm run dev -- --port 5003 --host

# Build for production
npm run build

# Run tests
npm run test

# Lint/format
npm run lint
npm run format
```

---

## Production Deployment

### How It Works
- **Frontend:** React app built as static files, deployed to Cloudflare Pages
- **Backend:** Cloudflare Worker API (already deployed at swing-platform.brianduryea.workers.dev)
- **Database:** Cloudflare D1 (swing-platform-db)
- **Video Storage:** Cloudflare R2 (swing-videos bucket) + Stream (for MP4 conversion)

### Deployment Architecture
```
GitHub Repo (batdigest-swing-platform)
    ↓ (auto-deploy on push)
Cloudflare Pages (swing.batdigest.com)
    ↓ (API calls)
Cloudflare Worker (swing-platform.brianduryea.workers.dev)
    ↓
D1 Database + R2 Storage + Stream
```

### To Deploy Updates

#### 1. Build for Production
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-swing-analysis-project/swing-analysis

# Build with production environment variables
npx vite build --mode production
```

#### 2. Push to GitHub
```bash
cd dist
git add .
git commit -m "Your update message"
git push
```

Cloudflare Pages will automatically deploy within ~1 minute!

#### 3. Deploy Worker Updates (if needed)
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-flask/workers/swing-platform
CLOUDFLARE_API_TOKEN="PJvfE0dIRCqJ6-7k2x5uzIJUInJliBWAgrMjYQc0" wrangler deploy
```

### Initial Setup (Already Done)
1. Built React app with `npx vite build --mode production`
2. Created GitHub repo from dist folder:
   ```bash
   cd dist
   git init
   git add .
   git commit -m "Initial deployment"
   gh repo create batdigest-swing-platform --public --source=. --push
   ```
3. Connected to Cloudflare Pages:
   - Framework preset: None
   - Build command: (leave empty)
   - Build output directory: `/`
4. Added custom domain: swing.batdigest.com

### Important Files
- `.env.production` - Production environment variables (API endpoints)
- `.env.local` - Local development environment
- `dist/` - Built static files (this is what gets deployed)

### Environment Setup
Create `.env.local` in the `swing-analysis` folder:

```env
# CRITICAL: Use swing-platform, NOT swing-analysis-api
VITE_API_BASE=https://swing-platform.brianduryea.workers.dev

# Cloudflare Stream API Token (for WebM to MP4 conversion)
# Note: This is stored as a secret in the Worker, not used directly in frontend
STREAM_API_TOKEN=VX5-4N0JWM234saga2odPLv3rJJedBdca_X_shhp

# Cloudflare Account ID (for Stream API calls)
CF_ACCOUNT_ID=f791be9be6d12e1353b13e587d3eccd9

# Cloudflare API Token (for Worker deployment)
# Created: Aug 27, 2025 - Edit Cloudflare Workers template
CLOUDFLARE_API_TOKEN=PJvfE0dIRCqJ6-7k2x5uzIJUInJliBWAgrMjYQc0

# Supabase (if using auth - currently not implemented)
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

---

## Current Implementation Status

### ✅ Working Features
1. **Admin Queue Page** (`/admin/queue`)
   - Fetches pending submissions from Cloudflare D1
   - Shows athlete name, video size, wait time, notes
   - Displays submission stats (pending, analyzing, longest wait)
   - "Analyze" button stores video info and navigates to analyzer

2. **Video Submission Integration**
   - Pulls from same D1 database as iOS app
   - Uses same R2 bucket (`swing-videos`) for video storage
   - Submission data includes:
     - Athlete name, video size, submission ID
     - User preferences (wants drills, bat advice, mechanics)
     - Camera angle (always "front" now)
     - Upload timestamp and notes

3. **Video Streaming**
   - Videos stream from: `https://swing-platform.brianduryea.workers.dev/api/video/stream/{submissionId}`
   - No authentication required (public endpoint)

### 🚧 In Progress / Needs Work
1. **Analyzer Page** (`/admin/analyzer`)
   - Basic video loading implemented
   - Canvas overlay for annotations partially working
   - Recording functionality needs testing

2. **Analysis Export**
   - ✅ WebM recording captures tab + mic
   - ✅ Upload to Cloudflare Stream implemented
   - ✅ Automatic transcode to MP4 via Stream
   - ✅ Webhook for conversion completion

3. **User Authentication**
   - Currently using simple password protection
   - Supabase integration scaffolded but not active

---

## Database Schema (Cloudflare D1)

### `video_submissions` table
```sql
{
  id: INTEGER PRIMARY KEY,
  submission_id: TEXT UNIQUE,
  user_id: INTEGER,
  r2_key: TEXT,           -- Path in R2: "videos/2025/{uuid}.mp4"
  video_size: INTEGER,    -- Size in bytes
  athlete_name: TEXT,
  camera_angle: TEXT,     -- Always "front" now
  notes: TEXT,
  wants_bat_advice: INTEGER (0/1),
  wants_drills: INTEGER (0/1),
  wants_mechanics: INTEGER (0/1),
  status: TEXT,          -- "pending", "analyzing", "completed"
  created_at: DATETIME,
  updated_at: DATETIME
}
```

---

## API Endpoints (swing-platform Worker)

### Get Submissions
```
GET https://swing-platform.brianduryea.workers.dev/api/submissions
GET https://swing-platform.brianduryea.workers.dev/api/submissions?status=pending
```

### Stream Video
```
GET https://swing-platform.brianduryea.workers.dev/api/video/stream/{submissionId}
```

### Update Status (needs implementation on Worker side)
```
PATCH https://swing-platform.brianduryea.workers.dev/api/submission/{submissionId}/status
Body: { "status": "analyzing" | "completed" }
```

---

## Core Workflow

1. **Coach Login**
   - Navigate to `/admin/queue`
   - Enter password: `coach500admin`

2. **View Queue**
   - Page fetches from D1 database via Worker API
   - Shows all pending submissions sorted by wait time
   - Displays key info: athlete, video size, notes, wait time

3. **Start Analysis**
   - Click "Analyze →" on a submission
   - Stores video URL and submission data in sessionStorage
   - Navigates to `/admin/analyzer` (currently `/analyzer` route)

4. **Analyze Video** (partially implemented)
   - Load video from R2 via streaming endpoint
   - Scrub frame-by-frame
   - Add annotations (lines, arrows, boxes)
   - Record voiceover while screen-capturing
   - Export analysis video

5. **Save Analysis** (not implemented)
   - Upload WebM to R2
   - Update submission status to "completed"
   - Store analysis metadata
   - Trigger notification to player

---

## Known Issues & TODOs

### Issues
1. ❌ Analyzer page video loading inconsistent
2. ❌ Canvas annotations not persisting properly
3. ❌ Recording feature needs Chrome permissions setup
4. ❌ No analysis upload/save functionality

### TODOs
1. ✅ Implement analysis video upload (now using Cloudflare Stream)
2. ✅ Add webhook for video transcoding (Stream handles MP4 conversion)
3. Create player notification system
4. Add analysis history/library view
5. Implement proper user authentication
6. ✅ Add submission status updates to D1 (added Stream fields)

---

## Testing Video Submissions

### Check Current Queue
```bash
curl -s "https://swing-platform.brianduryea.workers.dev/api/submissions?status=pending" | python3 -m json.tool
```

### Database Commands (via Wrangler)
```bash
# View all submissions
wrangler d1 execute swing-platform-db --remote \
  --command="SELECT * FROM video_submissions WHERE status='pending'"

# Update submission status
wrangler d1 execute swing-platform-db --remote \
  --command="UPDATE video_submissions SET status='analyzing' WHERE submission_id='...'"
```

---

## File Structure
```
batdigest-swing-analysis-project/
├── swing-analysis/          # React/Vite frontend app
│   ├── src/
│   │   ├── app/            # Page components
│   │   │   ├── NeedAnalysisPage.tsx    # Queue page
│   │   │   └── LoadVideoPage.tsx       # Analyzer page
│   │   ├── services/
│   │   │   └── api.ts      # API client (MUST use swing-platform)
│   │   └── components/
│   │       └── AdminAuth.tsx           # Password protection
│   ├── .env.local          # CRITICAL: Set correct API endpoint
│   └── package.json
├── cloudflare-backend/      # Worker code (if needed)
└── CLAUDE.md               # This file
```

---

## Browser Requirements
- **Chrome ≥122 on macOS**: Full support for recording
- **Other browsers**: Limited support, no screen recording
- **Mobile**: Not supported for coach interface

---

## Security Notes
- Admin password (`coach500admin`) is hardcoded in frontend - NOT SECURE for production
- Video URLs are public (no auth on streaming endpoint)
- No rate limiting on API endpoints
- Consider implementing proper auth before production

---

## Quick Start for Next Developer

1. **Check the queue is working:**
   ```bash
   cd swing-analysis
   npm run dev -- --port 5003
   # Navigate to http://localhost:5003/admin/queue
   # Password: coach500admin
   ```

2. **Verify API endpoint in `.env.local`:**
   ```
   VITE_API_BASE=https://swing-platform.brianduryea.workers.dev
   ```

3. **If queue is empty, check for submissions:**
   ```bash
   curl -s "https://swing-platform.brianduryea.workers.dev/api/submissions" | python3 -m json.tool
   ```

4. **Main files to check:**
   - `/src/app/NeedAnalysisPage.tsx` - Queue implementation
   - `/src/services/api.ts` - API client (MUST point to swing-platform)
   - `/src/components/AdminAuth.tsx` - Admin password

Remember: The iOS app submits videos to `swing-platform.brianduryea.workers.dev`, NOT `swing-analysis-api`. The queue page must use the same API to see the submissions.