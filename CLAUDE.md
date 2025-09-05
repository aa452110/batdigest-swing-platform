# CLAUDE.md - BatDigest Swing Analysis Coach Platform

## Current Status (Aug 28, 2025)
**WORKING:** Multi-coach system with unique logins and coach-specific video queues. Coaches can sign up, get unique invite codes, and see only their players' submissions.

**NEW (Aug 28, 2025):**
1. **Multi-Coach System** - Each coach has unique login and 6-character invite code
2. **Coach-Specific Queues** - Videos filtered by coach invite code
3. **Reference Video Management** - Coaches can manage their own reference videos (stored in localStorage)
4. **Coach Authentication** - JWT-based auth system with email verification

## Live URLs
- **Production Site:** https://swing.batdigest.com
- **API Endpoint:** https://swing-platform.brianduryea.workers.dev
- **GitHub Repo:** https://github.com/aa452110/batdigest-swing-platform

## Purpose
**Coach-only web app** for baseball swing analysis. Coaches load videos from submission queue, annotate (lines/arrows/boxes), scrub frame-by-frame while **recording voiceover**, create 7-day hitting plans, and export the session as a video for players. **Supported environment:** Chrome on macOS.

---

## Multi-Coach System

### Coach Registration & Authentication
- **Signup**: `/coach/signup` - Creates account with email, password, name, organization
- **Login**: `/coach/login` - Authenticates and redirects to `/coach/queue`
- **Invite Codes**: Each coach gets a unique 6-character alphanumeric code (e.g., `7JMZJ6`)
- **Test Coach**: 
  - Email: `testcoach@example.com`
  - Password: `TestPassword123!`
  - Invite Code: `7JMZJ6`

### Video Submission Flow
1. **Player enters coach code** in iOS app (optional field)
2. **Video tagged with `coach_code`** in database
3. **Coach sees only their videos** in queue (filtered by invite code)
4. **Unassigned videos** (code `000000`) go to general pool

### Database Schema Updates

#### `coaches` table
```sql
{
  id: INTEGER PRIMARY KEY,
  email: TEXT UNIQUE,
  password_hash: TEXT,
  full_name: TEXT,
  organization: TEXT,
  invite_code: TEXT UNIQUE,  -- 6-character code like "7JMZJ6"
  is_verified: INTEGER,       -- Email verification status
  verification_token: TEXT,
  subscription_tier: TEXT DEFAULT 'basic',
  max_players: INTEGER DEFAULT 100,
  created_at: DATETIME
}
```

#### `video_submissions` table (updated)
```sql
{
  id: INTEGER PRIMARY KEY,
  submission_id: TEXT UNIQUE,
  user_id: INTEGER,
  r2_key: TEXT,
  video_size: INTEGER,
  athlete_name: TEXT,
  coach_code: TEXT DEFAULT '000000',  -- Links to coach's invite_code
  camera_angle: TEXT,
  notes: TEXT,
  wants_bat_advice: INTEGER (0/1),
  wants_drills: INTEGER (0/1),
  wants_mechanics: INTEGER (0/1),
  status: TEXT,
  created_at: DATETIME,
  updated_at: DATETIME
}
```

---

## API Endpoints (swing-platform Worker)

### Coach Endpoints
```
POST /api/coach/signup
Body: { email, password, fullName, organization }
Returns: { success, coachId, message }

POST /api/coach/login  
Body: { email, password }
Returns: { success, token, coach: { id, email, fullName, inviteCode } }

GET /api/coach/submissions?coachCode=7JMZJ6
Headers: Authorization: Bearer <token>
Returns: { submissions: [...filtered by coach code] }
```

### Video Submission (updated)
```
POST /api/submission/create
Body: { 
  athleteName, 
  coachCode,  // NEW: Optional coach code (defaults to '000000')
  notes, 
  ...other fields 
}
Returns: { success, submissionId, coachCode }
```

### Get Submissions
```
GET /api/submissions?status=pending
GET /api/video/stream/{submissionId}
```

---

## Routes & Access

### Admin Routes (`/admin/*`)
- `/admin/queue` - View ALL video submissions (legacy admin view)
- `/admin/analyzer` - Analyze selected video
- `/admin/resource-videos` - Manage reference videos
- Password: `coach500admin`

### Coach Routes (`/coach/*`)
- `/coach/signup` - Coach registration
- `/coach/login` - Coach authentication
- `/coach/queue` - Coach-specific video queue (filtered by invite code)
- `/coach/analyzer` - Same analyzer as admin

---

## Reference Videos System

Coaches can manage their own reference videos, stored in browser localStorage:

### Storage Structure
```javascript
localStorage.setItem('coachReferenceVideos', JSON.stringify([
  { name: 'Pro Swing Example', url: 'blob://...' },
  { name: 'Youth Mechanics', url: 'blob://...' }
]));
```

### Features
- Videos stored locally on coach's machine
- Persists across sessions (until browser data cleared)
- Each coach has their own set of reference videos
- Fallback to default MLB player videos if none added

---

## Development

### Commands
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-swing-analysis-project/swing-analysis

# Start dev server
npm run dev -- --port 5003 --host

# Build for production
npm run build

# Lint/format
npm run lint
npm run format
```

### Deploy Worker Updates
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-flask/workers/swing-platform
CLOUDFLARE_API_TOKEN="s7HlXK59KBt8bkquZxivssAwox7j7a38rng8EXdE" wrangler deploy
```

### Deploy Frontend Updates
```bash
cd /Users/brianduryea/Coding_Projects/batdigest-swing-analysis-project/swing-analysis
npx vite build --mode production
cd dist
git add .
git commit -m "Update message"
git push
```

---

## Database Management

### View Coaches
```bash
CLOUDFLARE_API_TOKEN="s7HlXK59KBt8bkquZxivssAwox7j7a38rng8EXdE" \
wrangler d1 execute swing-platform-db --remote \
--command="SELECT id, email, full_name, invite_code, is_verified FROM coaches"
```

### View Submissions by Coach
```bash
CLOUDFLARE_API_TOKEN="s7HlXK59KBt8bkquZxivssAwox7j7a38rng8EXdE" \
wrangler d1 execute swing-platform-db --remote \
--command="SELECT * FROM video_submissions WHERE coach_code='7JMZJ6'"
```

### Verify Coach Account (for testing)
```bash
CLOUDFLARE_API_TOKEN="s7HlXK59KBt8bkquZxivssAwox7j7a38rng8EXdE" \
wrangler d1 execute swing-platform-db --remote \
--command="UPDATE coaches SET is_verified=1 WHERE email='testcoach@example.com'"
```

---

## Environment Setup

Create `.env.local` in the `swing-analysis` folder:

```env
# API Endpoint
VITE_API_BASE=https://swing-platform.brianduryea.workers.dev

# Cloudflare Tokens (for deployment)
CLOUDFLARE_API_TOKEN=s7HlXK59KBt8bkquZxivssAwox7j7a38rng8EXdE
CF_ACCOUNT_ID=f791be9be6d12e1353b13e587d3eccd9

# Stream API (for video conversion)
STREAM_API_TOKEN=VX5-4N0JWM234saga2odPLv3rJJedBdca_X_shhp
```

---

## Current Implementation Status

### ✅ Completed Features
1. **Multi-Coach System**
   - Coach signup/login with unique invite codes
   - Coach-specific video queues
   - JWT authentication (basic implementation)
   - Email verification system (ready, needs email service)

2. **Video Submission with Coach Codes**
   - Backend accepts `coachCode` field
   - Validates 6-character alphanumeric format
   - Defaults to '000000' for general pool
   - Filters submissions by coach code

3. **Reference Video Management**
   - localStorage-based storage per coach
   - Add/remove videos through UI
   - Fallback to default videos

4. **Video Analysis Features**
   - Frame-by-frame scrubbing
   - Canvas annotations (lines, arrows, boxes)
   - Screen + mic recording
   - WebM to MP4 conversion via Cloudflare Stream

### 🚧 Needs Implementation
1. **iOS App Updates**
   - Add coach code input field on submission screen
   - Include `coachCode` in API payload

2. **Email Verification**
   - Configure email service for verification links
   - Currently coaches need manual verification

3. **Coach Dashboard**
   - Analytics on player submissions
   - Subscription management
   - Player roster management

---

## File Structure
```
batdigest-swing-analysis-project/
├── swing-analysis/          # React/Vite frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── CoachLoginPage.tsx
│   │   │   ├── CoachQueuePage.tsx     # Coach-specific queue
│   │   │   ├── CoachSignupPage.tsx
│   │   │   ├── LoadVideoPage.tsx      # Video analyzer
│   │   │   └── NeedAnalysisPage.tsx   # Admin queue (all videos)
│   │   ├── modules/
│   │   │   └── video/
│   │   │       └── ReferenceVideos.tsx # Coach reference videos
│   │   └── services/
│   │       └── api.ts
│   └── dist/                # Separate Git repo for deployment

batdigest-flask/
└── workers/
    └── swing-platform/      # Cloudflare Worker API
        ├── src/
        │   └── index.js     # API endpoints
        └── migrations/
            └── add_coach_system.sql
```

---

## Security Notes
- Coach passwords are hashed with bcrypt
- JWT tokens for session management (basic implementation)
- Email verification required for coach accounts
- Video URLs are currently public (no auth on streaming)
- Consider implementing:
  - Token refresh mechanism
  - Rate limiting
  - Secure video streaming

---

## Quick Start for Coaches

1. **Sign Up**: Navigate to `/coach/signup`
2. **Get Invite Code**: Provided after signup (e.g., `7JMZJ6`)
3. **Share with Players**: Players enter code in iOS app
4. **Login**: `/coach/login` with email/password
5. **View Queue**: See only your players' submissions
6. **Analyze**: Click "Analyze" to review and annotate videos
7. **Manage References**: Add your own reference videos at `/admin/resource-videos`

Remember: The iOS app needs to be updated to include a coach code input field for this system to fully work.