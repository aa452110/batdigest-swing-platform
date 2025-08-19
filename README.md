





Step 7 — Side-by-Side & Overlay Compare

Add second video panel (“Model Video”) with its own loader.

Sync controls: link play/pause; provide per-clip offset (ms).

Modes: Single | Side-by-Side | Overlay (opacity slider, align anchors).

Zoom/Pan per panel; reset view.

Done when: you can align two swings and scrub them together; overlay looks right.

Step 8 — File System & Library Access

Local: integrate File System Access API (where supported) for quick open/save from a folder.

Cloud: add storage service abstraction with two implementations:

Local stub (for dev)

Cloud (R2/S3/GCS via pre-signed URLs)

UI: left sidebar “Library” with recent videos, analysis outputs, and starred model clips.

Done when: you can open from library and save analysis outputs back to it.

Step 9 — Upload, Transcode, Deliver

Backend endpoints (Worker):
POST /upload-url → presigned PUT
POST /ingest → hand asset to Cloudflare Stream/Mux
POST /webhook/transcode → update asset status

Client: after recording, upload WebM → ingest → poll status → attach stream URL to the “analysis”.

Done when: analysis appears playable as MP4/HLS on any device; raw WebM archived.

Step 10 — Project/Player Association

Data model:
Player { id, name }
Submission { id, playerId, srcAssetId, notes }
Analysis { id, submissionId, reviewerId, timelineJSON, voiceBlobId?, streamAssetId, createdAt }

UI: select player → choose submission → open editor → produce analysis → save.

Done when: flow is end-to-end for one player with history.

Step 11 — Timeline Persistence & Re-Export

Persist timelineJSON (annotations + edits) with each analysis.

Add “Re-render” using the same timeline (Phase-2 compositor optional later).

Done when: you can reopen an analysis, tweak annotations, and re-export without re-recording everything.

Step 12 — Coach Quality-of-Life

Hotkeys: L line, A angle (two lines + degrees readout), B box, T text, Z undo, Y redo.

Guides: toggle vertical/horizontal grid, strike-zone template.

Templates: save common overlays (e.g., posture lines).

Done when: average analysis can be completed in 5–10 minutes comfortably.

Step 13 — Access Control & Audit

Auth: simple email link (Magic link via Clerk/Supabase).

Roles: coach, admin.

Audit trail: who recorded, duration, files touched.

Done when: only authorized coaches can access analyses; actions are logged.

Step 14 — Performance & Storage Hygiene

Streaming: use object URLs for local; use preload="metadata" for large files.

Memory: dispose canvases and revoke URLs on teardown.

Lifecycle: R2 rule—purge raw WebM after 30 days; keep MP4/HLS and timeline.

Done when: long sessions don’t crash; bucket growth is controlled.

Step 15 — “Chrome on Mac” Guardrails

Detect unsupported browsers; show “Use Chrome on macOS” banner for coaches.

Fallbacks: disable screen-capture features on Safari/older Edge.

Done when: no mystery bugs from unsupported APIs; clear guidance shown.

Minimal API Contract (for the bot)

POST /api/upload-url { filename, contentType } -> { url, key }

POST /api/ingest { key } -> { assetId }

POST /api/webhook/transcode { assetId, status, playbackUrl }

GET /api/library?playerId=... -> { submissions[], analyses[] }

POST /api/analysis { submissionId, timelineJSON, assetId }