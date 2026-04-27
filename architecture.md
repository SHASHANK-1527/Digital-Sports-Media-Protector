# Architecture — Digital Asset Protection MVP

## Folder Structureroot/
├── frontend/                         # React app
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminRegister.jsx     # Register new official asset
│   │   │   ├── DetectionPortal.jsx   # Public detection page
│   │   │   └── DetectionResult.jsx   # Result display page
│   │   ├── components/
│   │   │   ├── UploadZone.jsx        # Drag-and-drop file input
│   │   │   ├── ResultCard.jsx        # Verdict + score display
│   │   │   ├── ComparisonView.jsx    # Side-by-side original vs detected
│   │   │   ├── AnomalyAlert.jsx      # Real-time viral alert banner
│   │   │   ├── AssetTable.jsx        # Paginated registered assets table
│   │   │   └── Navbar.jsx
│   │   ├── services/
│   │   │   ├── firebase.js           # Firebase init + exports
│   │   │   ├── api.js                # All calls to FastAPI backend
│   │   │   └── auth.js               # Firebase Auth helpers
│   │   ├── hooks/
│   │   │   └── useAnomalyListener.js # Firestore real-time hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                          # VITE_API_URL, Firebase config keys
│   └── package.json├── backend/                          # Python FastAPI app
│   ├── main.py                       # App entry, route registration
│   ├── routers/
│   │   ├── register.py               # POST /register
│   │   ├── detect.py                 # POST /detect
│   │   └── assets.py                 # GET /assets, GET /detections
│   ├── services/
│   │   ├── fingerprint.py            # pHash generation
│   │   ├── embedding.py              # MobileNetV2 CNN embedding
│   │   ├── matcher.py                # Hamming + cosine matching logic
│   │   ├── scorer.py                 # Context-aware verdict scoring
│   │   ├── gemini.py                 # Gemini API calls
│   │   ├── watermark.py              # DCT watermark embed + extract
│   │   ├── ingest.py                 # URL fetch + media normalization
│   │   └── report.py                 # PDF evidence report generation
│   ├── db/
│   │   └── firestore.py              # Firestore client + helpers
│   ├── models/
│   │   └── schemas.py                # Pydantic request/response models
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env                          # GOOGLE_API_KEY, Firebase creds, etc.├── specs.md
├── architecture.md
├── frontend_specs.md
└── backend_specs.md

---

## Firestore Collections

### `official_media`{
content_id: string (uuid),
owner_name: string,
sport_category: string,
file_url: string,              // Firebase Storage URL
phash: string,                 // 64-bit hex string
embedding: array<float>,       // 1280-dim MobileNetV2 vector
watermark_payload: string,     // content_id + owner_name + timestamp
upload_timestamp: timestamp,
detection_count: number        // incremented on every match found
}

### `detections`{
detection_id: string (uuid),
submitted_url: string | null,
submitted_filename: string | null,
verdict: string,               // "Pirated" | "Suspicious" | "Original" | "Unknown"
confidence_score: number,      // 0.0 – 1.0
matched_content_id: string | null,
similarity_score: number,
coverage_ratio: number,
timestamp_match_start: number | null,  // seconds
timestamp_match_end: number | null,
gemini_description: string | null,
detection_timestamp: timestamp
}

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | Firebase ID token (header) | Register official media asset |
| POST | `/detect` | None | Run detection on uploaded file or URL |
| GET | `/assets` | Firebase ID token | List all assets for authenticated owner |
| GET | `/detections` | None | List recent detections (public, paginated) |
| GET | `/detections/{detection_id}/report` | None | Download PDF evidence report |

---

## Environment Variables

### Backend `.env`GOOGLE_API_KEY=                  # Gemini API key (Google AI Studio)
FIREBASE_SERVICE_ACCOUNT_PATH=   # Path to Firebase service account JSON
FIREBASE_STORAGE_BUCKET=         # e.g. your-app.appspot.com
VERTEX_AI_ENDPOINT=              # Optional: Vertex AI prediction endpoint URL
GCP_PROJECT_ID=

### Frontend `.env`VITE_API_URL=                    # Cloud Run backend URL
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_APP_ID=

---

## Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | UI for both portals |
| Auth | Firebase Auth | Admin portal login |
| Database | Firestore | Fingerprint registry + detection log |
| File storage | Firebase Storage | Official media files |
| Backend | FastAPI (Python) | Detection pipeline API |
| Deployment | Google Cloud Run | Containerized backend |
| Fingerprinting | imagehash (pHash) | Fast perceptual hash |
| Embedding | MobileNetV2 (torchvision) | Robust CNN feature vector |
| AI reasoning | Gemini API | Content description + report text |
| Media processing | ffmpeg + OpenCV | Frame extraction + normalization |
| URL fetching | yt-dlp + requests | Download from YouTube / direct links |
| Watermarking | invisible-watermark | DCT-based embed/extract |
| PDF generation | ReportLab | Evidence report |

---

## Anomaly Detection Logic

- Every time a detection results in a "Pirated" or "Suspicious" verdict,
  increment `detection_count` on the matched `official_media` document
- Firestore real-time listener on the admin dashboard watches all docs
  where `detection_count >= 5` AND `updated_within_last_24h`
- When triggered, show `AnomalyAlert` banner:
  "This asset is spreading without authorization — 5+ detections in 24h"