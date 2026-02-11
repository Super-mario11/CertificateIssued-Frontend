# Frontend (Vite + React)

Production-ready frontend for the certificate portal.

## Stack
- React 18
- Vite 5
- React Router 6
- Axios
- Tailwind CSS

## Scripts
- `npm run dev`: start local dev server
- `npm run build`: create production build in `dist/`
- `npm run preview`: preview production build locally

## Environment Variables
Create `frontend/.env` from `frontend/.env.example`.

- `VITE_API_BASE_URL`: backend API base URL
  - Local: `http://localhost:5000`
  - Production: `https://<your-render-service>.onrender.com`

Example:

```env
VITE_API_BASE_URL="https://certificate-api.onrender.com"
```

## Local Development
1. Install dependencies:
```bash
npm install
```
2. Set `frontend/.env`.
3. Start dev server:
```bash
npm run dev
```

## Production Build Check
```bash
npm run build
```

## Deploy to Vercel
1. Push frontend code to GitHub.
2. In Vercel, import project.
3. Set:
   - Framework preset: `Vite`
   - Root directory: `frontend` (if monorepo)
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add environment variable:
   - `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com`
5. Deploy.

### SPA Routing
This repo includes `frontend/vercel.json` rewrite config so all routes resolve to `index.html`.

## Performance/Production Notes
- Route-level lazy loading is enabled in `frontend/src/router.jsx`.
- Image tags use native `loading="lazy"` where applicable.
- Keep API URL in env only, never hardcode production endpoints in source.

## Troubleshooting
- If build fails with `ENOENT package.json`, run command from correct folder:
  - inside `frontend`: `npm run build`
  - from repo root: `npm --prefix frontend run build`
- If API calls fail in production, verify `VITE_API_BASE_URL` and backend CORS settings.
