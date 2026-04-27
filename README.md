# Digital Asset Protection

Digital Asset Protection is a two-sided platform for detecting unauthorized use of sports media. The frontend is a React + Vite application. The backend is a Python FastAPI service that processes uploads, detects pirated content, and stores official media fingerprints in Firestore.

## Project Structure

- `frontend/` — React application
- `backend/` — FastAPI backend
- `Specs.md` — product-level requirements
- `architecture.md` — architecture, routes, schema, environment variables
- `frontend_specs.md` — frontend pages, components, hooks, services
- `backend_specs.md` — backend endpoints, services, models

## Frontend Setup

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `frontend/.env` with the required Firebase and API variables.
4. Run the frontend:
   ```bash
   npm run dev
   ```

## Backend Setup

1. Open a terminal in `backend/`
2. Create a Python virtual environment and activate it.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `backend/.env` with the required Google and Firebase variables.
5. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

## Environment Variables

Frontend `.env` variables are defined in `frontend/.env`.
Backend `.env` variables are defined in `backend/.env`.

## Notes

This scaffold contains placeholder files only. No business logic is implemented yet. Once the project structure is confirmed, the next step is to add routing, API integration, and backend service workflows.
