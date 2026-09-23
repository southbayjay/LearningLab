# LearningLab - AI-Powered Reading Comprehension Worksheet Generator

LearningLab lets educators and parents generate a reading-comprehension worksheet (passage, five multiple-choice questions, two short-answer questions and an answer key) for any K-12 grade level and topic, using OpenAI's `gpt-5-mini` model, and print it straight from the browser.

## Features

- **Grade-level specific (K-12)** - vocabulary and complexity tailored to the selected grade
- **Topic-based** - pick one of the curated topics or type your own
- **Print-ready output** - clean worksheet and answer-key layout via the browser's print dialog
- **Built-in abuse controls** - per-IP rate limiting, request size limits, topic filtering

## Architecture

```
LearningLab/
├── server/                  # Express API (TypeScript, ESM) — used for local dev / self-hosting
│   ├── src/
│   │   ├── config/          # env loading, OpenAI settings
│   │   ├── controllers/     # /api/generate-worksheet handler
│   │   ├── middleware/      # validation, rate limiting, error handling
│   │   ├── routes/
│   │   └── services/        # OpenAI call + prompt
│   └── client/              # React 19 + Vite 8 + Tailwind CSS 4 front end (own lockfile)
├── functions/api/           # Cloudflare Pages Functions — the production API
├── test/                    # Tests for the Cloudflare function
├── wrangler.toml            # Cloudflare Pages configuration
└── .github/                 # CI (typecheck, lint, tests, build, smoke test) and Dependabot
```

The front end is a static Vite build. In production it is hosted on **Cloudflare Pages** and calls `functions/api/generate-worksheet.js` on the same origin. For local development (and for self-hosting on a Node server) the same client is served by the Express app in `server/`, which exposes an equivalent `POST /api/generate-worksheet` endpoint. The two API implementations share the same request validation rules and rate limits; keep them in sync when changing either.

### Tech stack

| Layer | Technology |
|-------|------------|
| Front end | React 19, Vite 8, Tailwind CSS 4, Headless UI, Heroicons |
| Local/self-hosted API | Node.js 22, Express 5, TypeScript, Zod, express-rate-limit, express-slow-down |
| Production API | Cloudflare Pages Functions + Workers KV (rate limiting) |
| AI | OpenAI Node SDK (`gpt-5-mini`, JSON mode) |

## Getting started

### Prerequisites

- Node.js **22.12+** (see `.node-version`; `nvm use` picks it up) and npm 10+
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Install

```bash
git clone https://github.com/southbayjay/LearningLab.git
cd LearningLab
npm install                 # root workspace + server
npm install --prefix server/client   # client has its own lockfile
```

### Configure

The Express server reads `server/.env` (not the repo root):

```bash
cp .env.example server/.env
# then set OPENAI_API_KEY=sk-... in server/.env
```

### Develop

```bash
npm run dev
```

- Express API on `http://localhost:3001`
- Vite dev server on `http://localhost:5173` (hot reload; calls the API on 3001 directly)

### Production build (self-hosted)

```bash
npm run build          # builds the client into server/client/dist
npm run build:server   # compiles the server into server/dist
NODE_ENV=production npm start
```

Express serves the built client and the API from `http://localhost:3001`. When running behind a reverse proxy set `TRUST_PROXY` (see `.env.example`) so rate limits apply per client IP rather than per proxy.

### Test and lint

```bash
npm test                          # Cloudflare function tests + server tests
npm run lint --prefix server      # ESLint (auto-fix)
npx tsc --noEmit -p server/tsconfig.eslint.json
```

### Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API (3001) and client (5173) with hot reload |
| `npm run dev:server` / `npm run dev:client` | Start one side only |
| `npm run build` | Build the client (`server/client/dist`) |
| `npm run build:server` | Compile the server (`server/dist`) |
| `npm start` | Run the compiled server |
| `npm test` | Run all tests |

## Environment variables

Set these in `server/.env` for the Express server, or in the Cloudflare Pages dashboard (Settings → Environment variables / Bindings) for production.

| Variable | Used by | Default | Description |
|----------|---------|---------|-------------|
| `OPENAI_API_KEY` | both | - | **Required.** OpenAI API key |
| `OPENAI_BASE_URL` | both | OpenAI | Override the OpenAI endpoint (testing / proxies) |
| `PORT` | Express | `3001` | Listen port |
| `NODE_ENV` | Express | `development` | `production` enables static serving and error redaction |
| `CORS_ORIGIN` | Express | `http://localhost:5173` | Allowed browser origin in development |
| `TRUST_PROXY` | Express | - | Express `trust proxy` setting when behind a reverse proxy |
| `WORKSHEET_RATE_LIMIT_MAX_REQUESTS` | Express | `10` | Worksheets per IP per window |
| `WORKSHEET_RATE_LIMIT_WINDOW_MS` | Express | `3600000` | Worksheet window (1 hour) |
| `GENERAL_RATE_LIMIT_MAX_REQUESTS` | Express | `100` | Requests per IP per window for all `/api/*` |
| `GENERAL_RATE_LIMIT_WINDOW_MS` | Express | `900000` | General window (15 minutes) |
| `ALLOWED_ORIGINS` | Cloudflare | - | Extra origins allowed to call the API (comma-separated); same-origin is always allowed |
| `RATE_LIMIT_KV` (KV binding) | Cloudflare | - | KV namespace used for per-IP rate limiting |

Request bodies are limited to 1 KB on both implementations.

## Deploying to Cloudflare Pages

1. Create a Pages project from this repository. Build command `npm run build:client`, output directory `server/client/dist` (already set in `wrangler.toml`).
2. Add `OPENAI_API_KEY` as an **encrypted** environment variable for Production (and Preview if you want previews to work).
3. Create a KV namespace and bind it to the project as `RATE_LIMIT_KV` (Settings → Bindings).
4. Recommended: add a Cloudflare WAF rate-limiting rule on `/api/*` (e.g. 20 requests / 10 minutes per IP). KV counters are eventually consistent, so the WAF rule is the hard edge limit and the function-level limit is the per-user quota.
5. Set a monthly spend limit on the OpenAI API key you use for the deployment.

To run the Pages function locally:

```bash
npm run build
npx wrangler pages dev server/client/dist --kv RATE_LIMIT_KV --binding OPENAI_API_KEY=sk-...
```

## Security

- **Rate limiting**: 10 worksheet generations per hour per IP (Express and Cloudflare), plus a general limit on the Express API and progressive slow-down after three worksheet requests.
- **Input validation**: shared Zod schema - K-12 grade levels only, topic 3-100 characters, inappropriate-content and spam filters, unknown fields rejected.
- **Request size limits**: 1 KB body limit before any parsing.
- **Upstream error masking**: OpenAI errors are never forwarded to the client.
- **Security headers**: Helmet on Express; `server/client/public/_headers` on Cloudflare Pages (CSP, HSTS, frame denial, etc.).
- **Secrets**: only `OPENAI_API_KEY` is needed; keep it in `server/.env` (git-ignored) or the Cloudflare dashboard, never in the repo.
- **CI**: read-only `GITHUB_TOKEN`, SHA-pinned actions, Dependabot for npm and GitHub Actions.

## Roadmap

- Request caching to reduce API costs
- User accounts with per-user quotas and saved worksheets
- Additional worksheet formats and languages

## Contributing

1. Fork the repository and create a feature branch
2. Run `npm test`, `npm run lint --prefix server` and `npm run build` before opening a PR
3. Open a Pull Request against `main`

## License

MIT - see [LICENSE](LICENSE).
