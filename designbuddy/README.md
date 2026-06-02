# ✦ DesignBuddy AI

> AI-powered UI design analyzer — upload screenshots, pick your aesthetic vibe, get expert feedback instantly.

![Stack](https://img.shields.io/badge/stack-Node.js%20%2B%20React-7c5cfc?style=flat-square)
![DB](https://img.shields.io/badge/database-SQLite-38bdf8?style=flat-square)
![AI](https://img.shields.io/badge/AI-Claude%20(Anthropic)-c084fc?style=flat-square)

---

## Features

- 🖼 **Image upload** — drag & drop up to 5 screenshots per analysis
- 🎨 **Aesthetic vibes** — Minimal, Bold & Dark, Glassmorphic, Neumorphic, Brutalist, Soft & Pastel
- 🤖 **AI analysis** — powered by Claude, gives score, issues, quick wins, CSS snippets
- 💾 **History** — all analyses saved to SQLite, browsable by session or globally
- 🔒 **Secure** — API key stays on the server, never exposed to the browser
- 📱 **Mobile friendly** — responsive layout, works on Android & iOS

---

## Project Structure

```
designbuddy/
├── server/               # Node.js + Express backend
│   ├── index.js          # Main server (routes, Anthropic integration)
│   ├── db.js             # SQLite setup + queries
│   ├── data/             # SQLite database file (auto-created)
│   ├── .env.example      # Environment variable template
│   └── package.json
│
├── client/               # React (Vite) frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AnalyzePage.jsx   # Main chat interface
│   │   │   └── HistoryPage.jsx   # Saved analyses
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── UploadZone.jsx
│   │   │   ├── VibeSelector.jsx
│   │   │   └── AnalysisCard.jsx
│   │   ├── hooks/
│   │   │   └── useSession.js
│   │   ├── api.js         # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── package.json           # Root — runs both together
└── README.md
```

---

## Quick Start (Local Development)

### 1. Clone & install

```bash
git clone https://github.com/yourname/designbuddy.git
cd designbuddy
npm run install:all
```

### 2. Set up environment variables

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
CLIENT_URL=http://localhost:5173
```

Get your API key at [console.anthropic.com](https://console.anthropic.com)

### 3. Run in development

```bash
# From root — starts both server (3001) and client (5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — that's it!

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/analyze` | Run an analysis (multipart/form-data) |
| `GET` | `/api/history` | Get analyses (optional `?session_id=xxx`) |
| `GET` | `/api/history/:id` | Get single analysis |
| `DELETE` | `/api/history/:id` | Delete an analysis |
| `GET` | `/api/stats` | Total analyses, avg score, sessions |

### POST /api/analyze — fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `images` | File[] | No | Up to 5 image files |
| `prompt` | string | No* | User's question/description |
| `vibe` | string | Yes | One of: minimal, bold, glassmorphism, neomorphism, brutalist, soft |
| `session_id` | string | No | Browser session ID for history grouping |

*At least one of `images` or `prompt` is required.

---

## Production Deployment

### Option A — Single VPS (simplest)

```bash
# Build the React frontend
npm run build

# The Express server serves the built frontend automatically
# Just run:
cd server && npm start
```

Then point your domain/nginx to port 3001.

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

### Option B — Railway (one-click cloud)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables in Railway dashboard:
   - `ANTHROPIC_API_KEY`
   - `CLIENT_URL` → your Railway domain
4. Railway auto-detects Node.js and deploys

### Option C — Vercel (frontend) + Railway (backend)

**Backend on Railway:**
- Deploy `server/` folder
- Set env vars

**Frontend on Vercel:**
- Deploy `client/` folder
- Set `VITE_API_URL=https://your-railway-url.railway.app` in Vercel env
- Update `client/src/api.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | — | **Required.** Your Anthropic API key |
| `PORT` | `3001` | Server port |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (for CORS) |
| `MAX_FILE_SIZE_MB` | `10` | Max image size in MB |
| `MAX_IMAGES_PER_REQUEST` | `5` | Max images per analysis |
| `RATE_LIMIT_MAX` | `30` | Max requests per IP per 15 min |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Backend | Node.js, Express |
| Database | SQLite (via better-sqlite3) |
| AI | Anthropic Claude (claude-opus-4-5) |
| File uploads | Multer (memory storage) |
| Rate limiting | express-rate-limit |

---

## License

MIT — build whatever you want with it.
