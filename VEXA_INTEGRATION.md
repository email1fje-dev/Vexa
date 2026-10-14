# Vexa integration
- The original root `index.html` is preserved.
- The Discord-like React frontend source is in `frontend/`.
- The Node/Express backend source is in `backend/`.
- The production frontend build is in `webapp/`; `app.html` routes into it.
- Copy `backend/.env.example` to `backend/.env`, set a strong JWT_SECRET and real MongoDB/Redis URLs, then deploy the backend separately. Update frontend API_URL to the deployed backend before rebuilding for production.
- Never commit real environment files or credentials.
