# LearningLab Server

Express 5 + TypeScript API for LearningLab, used for local development and for self-hosting on a Node server. Production runs on Cloudflare Pages Functions (`../functions/api`), which mirror this API.

See the [root README](../README.md) for setup, environment variables and deployment.

## Layout

```
src/
├── config/        # server/.env loading, OpenAI settings
├── controllers/   # POST /api/generate-worksheet
├── middleware/    # validation (Zod), rate limiting, error handling
├── routes/
├── services/      # OpenAI call and prompt
├── types/
└── utils/
client/            # React front end (separate lockfile)
```

## Commands (run from `server/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | `tsx watch` with hot reload on port 3001 |
| `npm run build:server` | Compile to `dist/` |
| `npm start` | Run `dist/index.js` |
| `npm test` | Node test runner (`src/**/*.test.ts`) |
| `npm run lint` | ESLint with auto-fix |
| `npm run format` | Prettier |
| `npx tsc --noEmit -p tsconfig.eslint.json` | Typecheck including tests |

## API

### `GET /api/health`

```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z", "environment": "development" }
```

### `POST /api/generate-worksheet`

Request (JSON, max 1 KB):

```json
{ "gradeLevel": "3rd Grade", "topic": "Volcanoes", "complexity": "medium" }
```

- `gradeLevel`: `Kindergarten`, `1st Grade` … `12th Grade` (also `K`, `1`-`12`, `Elementary`, `Middle School`, `High School`)
- `topic`: 3-100 characters; inappropriate and spam-like topics are rejected
- `complexity`: optional, `easy` | `medium` | `hard`

Response `200`:

```json
{
  "title": "...",
  "passage": "...",
  "multipleChoice": [{ "question": "...", "options": ["...", "..."], "answer": "..." }],
  "shortAnswer": [{ "question": "...", "answer": "..." }]
}
```

Errors: `400` invalid input, `413` body too large, `429` rate limited (`RateLimit-*` headers), `500` upstream failure (details are never forwarded to the client).
