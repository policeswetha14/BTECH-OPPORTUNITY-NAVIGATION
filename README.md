# BTech Opportunity Navigation

A student opportunity discovery, recommendation, and tracking application.

## Stack
- Frontend: Next.js + TypeScript
- Backend: FastAPI + Python
- Persistence: SQLite for accounts, profiles, sessions, saved opportunities, and application statuses
- Opportunity catalog: existing backend opportunity data, seeded without overwriting database records

## Run locally

### Backend
```bash
cd backend
py -3.12 -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Set BTECH_SESSION_SECRET in .env to a random secret of at least 32 characters.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
Copy-Item .env.local.example .env.local
npm run dev
```

Then open http://localhost:3000. The API health check is available at http://localhost:8000/health.

For local HTTP, `BTECH_COOKIE_SECURE=false` is required in the backend environment. Set it to `true` behind HTTPS in a deployment, and configure a private database path, a unique session secret, and the allowed frontend origins.

## Account recovery and OAuth

Email delivery for password resets and Google OAuth are not configured. The UI does not claim that a reset email was sent, and the Google sign-in option remains unavailable until an OAuth provider is configured.

## Validation
```bash
cd backend
python -m pytest -q
```

Frontend checks:
```bash
cd frontend
npm run lint
npm run build
```
