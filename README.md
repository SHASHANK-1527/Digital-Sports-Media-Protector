# Digital Asset Protection (DAP)
### AI-Powered Forensic Platform for Sports Media Integrity

Digital Asset Protection is an end-to-end forensic solution designed to detect, analyze, and report unauthorized use of high-value sports media. Using a combination of perceptual hashing, deep learning embeddings, and Gemini AI, DAP provides rights holders with actionable evidence for DMCA takedowns and platform enforcement.

---

## 🚀 Key Features

- **Multi-Modal Detection**: Supports both static images and video segments.
- **Forensic Fingerprinting**: Uses advanced Phash and MobileNet-V2 embeddings to identify matches even with significant compression, cropping, or color shifts.
- **Gemini-Powered Analysis**: Automatically generates descriptive AI analysis of infringing content to aid in legal documentation.
- **Automated Evidence Reports**: Generates professional PDF forensic reports ready for submission to platform moderation teams.
- **Forensic Watermarking**: Detects invisible DCT-based watermarks to prove ownership definitively.
- **Admin Dashboard**: Comprehensive management interface for registering official assets and monitoring batch detection jobs.

## 🛠 Tech Stack

- **Backend**: FastAPI (Python), PyTorch (Embeddings), OpenCV (Frame Extraction), ReportLab (PDF Generation).
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion (Animations), Lucide (Icons).
- **AI/ML**: Google Gemini 1.5 Flash (Content Analysis), MobileNet-V2 (Feature Extraction).
- **Database**: Google Cloud Firestore (Metadata & Detection Logs).

---

## 🚦 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud Project with Gemini API enabled
- Firebase Project with Firestore enabled

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create and activate a virtual environment.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file with your credentials:
   ```env
   GOOGLE_API_KEY=your_gemini_api_key
   FIREBASE_SERVICE_ACCOUNT_PATH=./path/to/service-account.json
   GCP_PROJECT_ID=your-project-id
   ```
5. Start the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_BACKEND_URL=http://localhost:8000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📄 License
Internal Hackathon Project - Not for commercial distribution without prior authorization.
