# CLAUDE.md

## Purpose
Build a **coach-only web app** for baseball swing analysis. Coaches load videos, annotate (lines/arrows/boxes), scrub frame-by-frame while **recording voiceover**, and export the session as a video, saving it to cloud storage and attaching it to a player’s history. **Supported environment:** Chrome on macOS.

---

## Tech Stack

- **Language:** TypeScript (strict)
- **Framework:** React + Vite
- **State:** Zustand (simple stores, no boilerplate)
- **Styling:** Tailwind CSS (utility-first; minimal custom CSS)
- **Drawing:** HTML Canvas (Konva optional later)
- **Media:** MediaRecorder, getUserMedia, getDisplayMedia, WebAudio
- **Backend:** Cloudflare Workers + Queues; Cloudflare R2 for raw uploads; Cloudflare Stream (or Mux) for ingest/transcode/delivery
- **Auth:** Supabase Auth (email link) or Clerk (magic link) — pick one and stick with it (default: **Supabase**)
- **Testing:** Vitest + React Testing Library (smoke/unit on core modules only)
- **Lint/Format:** ESLint + Prettier (CI-enforced)

---

## Development Commands

- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview production build
- `npm run lint` – ESLint
- `npm run format` – Prettier write
- `npm run test` – Vitest

**Pre-commit:** run `npm run lint && npm run format && npm run test`

---

## Environment Variables

Create `.env.local` for dev. Example in `.env.example`.

**Required**
- `VITE_SUPABASE_URL=`  
- `VITE_SUPABASE_ANON_KEY=`

- `VITE_API_BASE=https://api.analysis.batdigest.com` *(Worker base URL)*

- `R2_ACCESS_KEY_ID=`  
- `R2_SECRET_ACCESS_KEY=`  
- `R2_BUCKET=`  
- `R2_PUBLIC_BASE_URL=` *(CDN/base path for direct GETs, if any)*

- `STREAM_API_TOKEN=` *(Cloudflare Stream or Mux token)*  
- `STREAM_WEBHOOK_SECRET=`  
- `STREAM_SIGNING_KEY=` *(for playback token if used)*

- `JWT_SIGNING_KEY=` *(if the Worker signs short-lived upload URLs)*

**Optional**
- `SENTRY_DSN=`  
- `LOG_LEVEL=info|debug`

**.env.example**
- VITE_SUPABASE_URL=https://xxxx.supabase.co
- VITE_SUPABASE_ANON_KEY=public-anon-key
- VITE_API_BASE=http://localhost:8787

- R2_ACCESS_KEY_ID=xxxx
- R2_SECRET_ACCESS_KEY=xxxx
- R2_BUCKET=analysis-raw
- R2_PUBLIC_BASE_URL=https://cdn.batdigest.com/analysis

- STREAM_API_TOKEN=xxxx
- STREAM_WEBHOOK_SECRET=xxxx
- STREAM_SIGNING_KEY=xxxx

- JWT_SIGNING_KEY=dev-only-not-secure
- LOG_LEVEL=debug


---

## Video Specifications

- **Max upload (per source video):** 500 MB (dev) → 1.5 GB (prod)  
- **Preferred codecs:** H.264 (avc1) + AAC (playback); accept `.mp4/.mov/.webm`
- **Recording output (coach capture):** WebM (VP9/Opus) → **server transcode** to MP4/HLS
- **Target export:** 1080p @ 30fps (fallback 720p if CPU-constrained)
- **Accepted frame rates:** 24–240 fps input; render/export at 30 fps (normalize)
- **Duration guidance:** Aim ≤ 6 minutes per analysis video

---

## Core Flow (MVP)

1. **Load Video:** file picker (local) or open from Library (R2/Stream).
2. **Scrub:** play/pause; frame-step (`[`,`]`); speed (0.25×/0.5×/1×).
3. **Annotate:** canvas overlay (line/arrow/box); timeline JSON with `tStart/tEnd`.
4. **Compare:** second video slot; side-by-side or overlay with offset + opacity; per-panel zoom/pan.
5. **Record Analysis:** capture **tab video** + **mic** via MediaRecorder; produce WebM.
6. **Upload/Transcode:** PUT to R2 → Worker enqueues ingest → Stream creates MP4/HLS → webhook updates record.
7. **Attach to Player:** save `Analysis { submissionId, timelineJSON, streamAssetId }`.
8. **Notify Player:** (future) email/push with playback link.

---

## Browser Compatibility (Coach Workstation)

- **Primary:** Chrome **≥ 122** on macOS  
- **APIs required:** `getDisplayMedia`, `getUserMedia`, `MediaRecorder`, WebAudio, File System Access (optional)  
- **Not supported (launch):** Safari (partial APIs), iOS browsers, legacy Edge/Firefox for capture

---

## File Size & Performance Constraints

- **Single-source video cap:** 1.5 GB (prod); enforce client-side warnings > 1.0 GB
- **Memory:** keep decoded video elements ≤2 simultaneously; dispose/revoke object URLs
- **Storage hygiene:** R2 lifecycle: purge raw WebMs after 30 days; keep MP4/HLS + timeline indefinitely
- **Canvas:** prefer OffscreenCanvas when available; throttle re-renders while scrubbing

---

## Minimal API Contract

- `POST /upload-url { filename, contentType } -> { url, key }`
- `POST /ingest { key } -> { assetId }`
- `POST /webhook/transcode { assetId, status, playbackUrl }`
- `GET /library?playerId=... -> { submissions[], analyses[] }`
- `POST /analysis { submissionId, timelineJSON, assetId }`

---

## Acceptance (Definition of Done)

- Coach can **load two videos**, **scrub frame-by-frame**, **draw lines/arrows/boxes** tied to timeline, **record voiceover while screen-capturing** the analysis, **export to WebM**, **upload**, and **see MP4/HLS playback** attached to a player’s history.

---

## README.md — Suggested Sections (keep short)

### 1) Project Setup
- **Node:** v20.x LTS
- **Install:** `npm i`
- **Run dev:** `npm run dev`
- **Env:** copy `.env.example` → `.env.local` and fill required keys

### 2) Backend Configuration
- **Cloudflare Workers:** `wrangler.toml` with routes for `/upload-url`, `/ingest`, `/webhook/transcode`
- **R2:** create bucket; set access keys; enable lifecycle rule (purge raw after 30 days)
- **Stream/Mux:** create API token, set webhook endpoint to `/webhook/transcode`

### 3) Deployment
- **Frontend:** deploy to Cloudflare Pages → `analysis.batdigest.com`  
- **API:** deploy Worker at `api.analysis.batdigest.com`  
- **Build:** `npm run build`; set env vars in Pages/Workers dashboard

### 4) File Size & Performance
- Max source: 1.5 GB; prefer 1080p30
- Warn on >1.0 GB; suggest trimming before upload
- Keep only 30 days of raw WebM; MP4/HLS retained

### 5) Browser Matrix
- Chrome ≥122 (macOS): **Full support**
- Firefox/Edge (latest): **Playback + basic editing** (no tab capture guarantee)
- Safari: **Unsupported** for recording; playback only
