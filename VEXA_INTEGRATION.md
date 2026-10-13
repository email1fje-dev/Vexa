# Vexa app integration

This directory is the imported React/Node chat application workspace based on the MIT-licensed
`miladr0/discord-clone` project. The existing root `index.html` landing page is intentionally
left unchanged.

## Workspace layout
- `frontend/`: React 17, React Router, Tailwind, Socket.IO client.
- `backend/`: Express API, Socket.IO, MongoDB/Mongoose and Redis adapter.
- Set environment variables from the example files before running either service.

## Local setup
1. Install Node.js compatible with the original project's dependencies.
2. Start MongoDB and Redis.
3. In `backend/`, copy `.env.example` to `.env`, replace the sample JWT secret, and set your database/Redis URLs.
4. Run `npm install` and `npm run dev` in `backend/`.
5. In `frontend/`, create a local `.env` with `API_URL=http://localhost:4000`, install dependencies and run `npm start`.

The app is not production-ready until database/Redis services and production API URLs are configured.
Do not commit real secrets or production credentials.
