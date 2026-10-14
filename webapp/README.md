# Vexa Web App — Phase 1

Fresh Persian RTL responsive front-end for Vexa: sign-in/sign-up forms, theme preferences, account home, profile view, settings, and logout.

## API connection

The app uses the existing backend:
- POST /api/v1/auth/register with { "username", "email", "password" }
- POST /api/v1/auth/login with { "email", "password" }
- POST /api/v1/auth/logout with { "refreshToken" }

Open **تنظیم اتصال سرور** on the sign-in page and enter the API base URL ending in /api/v1, for example https://your-backend.example/api/v1. The URL is saved in this browser only. A query parameter can also be used: ?api=https://your-backend.example/api/v1.

Email verification is not used by this front-end flow. The backend and its MongoDB configuration must still be deployed and reachable for real accounts to work. This UI intentionally does not fake successful authentication.

## Included in phase 1
- Persian / RTL interface, responsive for mobile
- Dark and light themes, saved locally
- Login and registration wired to backend endpoints
- Basic account home, profile view, settings, logout
- No placeholder chat, servers, or channels presented as working features
