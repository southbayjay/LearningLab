---
name: testing-learninglab
description: How to run and end-to-end test the LearningLab worksheet generator locally (dev + production servers, ports, static-file gotcha, rate-limit workarounds, and how to exercise the OpenAI-dependent generation path without an API key).
---

# Testing LearningLab locally

## Layout
- Client: `server/client` — React 18 + Vite (currently vite 6.x), dev port **5173**.
- API: `server/src` — Express 5, run with `tsx watch`, dev port **3001** (not 3000).
- Duplicated serverless copies of the endpoints: `api/generate-worksheet.js` (Vercel-style, CommonJS) and `functions/api/generate-worksheet.js` (Cloudflare Pages, ESM `onRequestPost`). Real production is Cloudflare Pages: static client + `functions/api/*`.

## Ports / wiring gotcha
In dev the client does **not** use the vite `/api` proxy: `server/client/src/config/constants.ts` hardcodes `http://localhost:3001` for non-production mode (in production mode the bundle uses a same-origin empty baseUrl). So the Express server must listen on **3001** (`PORT=3001`) and `CORS_ORIGIN` must be `http://localhost:5173`, otherwise the UI shows "Unable to connect to server".

## Required local config
`server/src/config/index.ts` `process.exit(1)`s when `OPENAI_API_KEY` is unset, and it loads `server/.env` (not the repo-root `.env`). Create `server/.env` with `OPENAI_API_KEY=...`, `PORT=3001`, `NODE_ENV=development`, `CORS_ORIGIN=http://localhost:5173`. It is gitignored; delete it when done.

## Booting both modes (verified working as of PR #6)
- Dev: `cd server && npm run dev` → `🚀 Server running on port 3001 in development mode`.
- Production: `cd server && npm run build:server && NODE_ENV=production PORT=3001 node dist/index.js`.

The server is a real ESM package (`"type": "module"` + `module: NodeNext`), so any new relative import needs an explicit `.js` extension and `__dirname` is unavailable — use `dirname(fileURLToPath(import.meta.url))`. Historical failures to watch for if these regress: `ReferenceError: __dirname is not defined in ES module scope` (dev) and `ReferenceError: exports is not defined in ES module scope` (prod, tsc emitting CJS).

Express 5 uses path-to-regexp v8, which rejects bare `*` routes with `TypeError: Missing parameter name at index 1: *`. Wildcards must be named (`/*splat`). The SPA-fallback route only registers when `NODE_ENV=production`, so **route-registration bugs are invisible in dev** — always boot production mode too.

## Production static-file gotcha
`server/src/index.ts` serves `path.join(dirname(import.meta.url), '../../public')`, which from `server/dist/index.js` resolves to the **repo-root `public/`** directory. No build script creates it (`npm run build` writes `server/client/dist`). With `public/` absent the server still boots and does not 500 — `/` returns 404 `Not found` and unknown routes return 404 JSON — but the SPA is not served at all. To test the real production path, `cp -r server/client/dist ./public` first, then `/` and any unknown non-API route return `index.html` (200) while `/api/*` 404s stay JSON. Remove the copied `public/` afterwards.

## Testing generation without an OPENAI_API_KEY
The openai Node SDK (v4) honors `OPENAI_BASE_URL`, so you can exercise the entire request path (express.json → zod validation → rate limiting → SDK HTTP call → `JSON.parse` → React render → print) against a local mock:
1. Run a tiny node http server that answers `POST /v1/chat/completions` with
   `{choices:[{message:{content: JSON.stringify(worksheet)}}]}` where `worksheet` has
   `{title, passage, multipleChoice:[{question,options[4],answer}]x5, shortAnswer:[{question,answer}]x2}`.
2. Start the API with `OPENAI_BASE_URL=http://localhost:8787/v1` and any non-empty `OPENAI_API_KEY`.
3. Prefix the mock strings with something like `MOCKLLM` so evidence clearly distinguishes mocked from real model output, and always report real-model generation as untested.
4. Because the mock returns a fixed fixture, two different generations look identical on screen — correlate with the server log line `Generating worksheet for: { gradeLevel: …, topic: … }` to prove the second request actually happened.

## Grade-level validation
`server/src/middleware/validation.ts` lowercases, trims, strips a trailing `" grade"`, then requires an **exact** match against the allow-list (`k`, `1`..`12`, `1st`..`12th`, `kindergarten`, `elementary`, `middle school`, `high school`). All 13 dropdown labels (`Kindergarten`, `1st Grade` … `12th Grade`) are accepted (verified in PR #6; before it, only `Kindergarten` worked). Junk like `e`, `99th Grade`, `"   "`, `grade`, or a >20-char string returns 400 `Invalid request data` with `Invalid grade level…` / `Grade level must be 20 characters or less`.

## Rate limiting during testing
`server/src/middleware/rateLimiting.ts`: 10 worksheet requests/hour and `express-slow-down` adds `hits * 2s` (up to 30s) after the 3rd request, keyed by **IP + User-Agent**. Long-hanging curl requests are usually this, not a hang. Trick: when sweeping many payloads (e.g. all 13 grades), send a **unique `User-Agent` per request** (`curl -A sweep-agent-$i`) so each gets its own bucket and runs instantly; use a single fixed UA when you actually want to demonstrate the 2s/4s/… delays and the 429.

## Print / PDF export
`Print Worksheet` calls `window.print()`. In automated Chrome this **blocks the CDP session**, so browser tool calls start failing. Capture the preview with `DISPLAY=:0 scrot -o file.png` and dismiss with `DISPLAY=:0 xdotool key Escape`; the browser tool recovers afterwards.

## Error-response expectations (security)
All three copies now return only `{"error":"Failed to generate worksheet","details":"Please try again. …"}` (Cloudflare's missing-key case returns `Configuration error` / "not configured") and log the upstream detail server-side; the Cloudflare `debug: {hasApiKey, runtime}` payload was removed. When re-testing, point the server at the real OpenAI base URL with a placeholder key and grep the client response for `sk-`, `Incorrect API key`, `platform.openai.com`, `401`, `debug` — all must be absent while the server log still shows the 401.

## Harnessing the serverless copies locally
- `api/generate-worksheet.js` is CommonJS: `require()` it and call with stub `req`/`res` objects (`res.status().json()`), asserting `POST` → 200 and `GET` → 405.
- `functions/api/generate-worksheet.js` is ESM but the repo root has no `"type": "module"`, so Node refuses to import it as `.js` (`Cannot use import statement outside a module`). Copy it to a `.mjs` file **inside the repo** (so `openai` resolves) and import that; build the context as `{ request: new Request(url, {method:'POST', body: JSON.stringify(...)}), env: { OPENAI_API_KEY } }`.

## Devin Secrets Needed
- `OPENAI_API_KEY` — only needed to test real model generation; everything else can be tested with the mock upstream above.
