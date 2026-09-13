---
name: testing-learninglab
description: How to run and end-to-end test the LearningLab worksheet generator locally (dev + production servers, ports, static-file gotcha, rate-limit workarounds, and how to exercise the OpenAI-dependent generation path without an API key).
---

# Testing LearningLab locally

## Layout
- Client: `server/client` — React 19 + Vite 8 (rolldown) + Tailwind 4 via `@tailwindcss/vite` (config still in `tailwind.config.js`, pulled in through `@config` in `src/index.css`), dev port **5173**.
- API: `server/src` — Express 5, run with `tsx watch`, dev port **3001** (not 3000).

## Node / install
- Root and server deps require Node **>=22.12** — run `source ~/.nvm/nvm.sh && nvm use 22` in every shell before npm/npx (the default node may be older).
- `server` is a root npm **workspace** and has no own lockfile: install with `npm install` at the repo root (this also installs server deps), then `npm install` in `server/client`. Root `npm install` may rewrite the `engines.node` metadata in the tracked root `package-lock.json` — check `git diff package-lock.json` and `git checkout -- package-lock.json` if it is only that.
- Static checks that should pass: root `npm run build` (client), `cd server && npx tsc --noEmit && npx eslint .` (eslint 10 flat config; warnings are pre-existing, only errors matter), `cd server/client && npx tsc --noEmit`.
- Duplicated serverless copies of the endpoints: `api/generate-worksheet.js` (Vercel-style, CommonJS) and `functions/api/generate-worksheet.js` (Cloudflare Pages, ESM `onRequestPost`). Real production is Cloudflare Pages: static client + `functions/api/*`.

## Ports / wiring gotcha
In dev the client does **not** use the vite `/api` proxy: `server/client/src/config/constants.ts` hardcodes `http://localhost:3001` for non-production mode (in production mode the bundle uses a same-origin empty baseUrl). So the Express server must listen on **3001** (`PORT=3001`) and `CORS_ORIGIN` must be `http://localhost:5173`, otherwise the UI shows "Unable to connect to server".

## Required local config
`server/src/config/index.ts` `process.exit(1)`s when `OPENAI_API_KEY` is unset, and it loads `server/.env` (not the repo-root `.env`). Create `server/.env` with `OPENAI_API_KEY=...`, `PORT=3001`, `NODE_ENV=development`, `CORS_ORIGIN=http://localhost:5173`. It is gitignored; delete it when done.

## Booting both modes (verified working as of PR #6)
- Dev: `cd server && npm run dev` → `🚀 Server running on port 3001 in development mode`.
- Production: `cd server && npx tsc && NODE_ENV=production PORT=3001 node dist/index.js` (after building the client at the root with `npm run build`). `dist/index.js` still reads `server/.env` for `OPENAI_API_KEY` / `OPENAI_BASE_URL`.

The server is a real ESM package (`"type": "module"` + `module: NodeNext`), so any new relative import needs an explicit `.js` extension and `__dirname` is unavailable — use `dirname(fileURLToPath(import.meta.url))`. Historical failures to watch for if these regress: `ReferenceError: __dirname is not defined in ES module scope` (dev) and `ReferenceError: exports is not defined in ES module scope` (prod, tsc emitting CJS).

Express 5 uses path-to-regexp v8, which rejects bare `*` routes with `TypeError: Missing parameter name at index 1: *`. Wildcards must be named (`/*splat`). The SPA-fallback route only registers when `NODE_ENV=production`, so **route-registration bugs are invisible in dev** — always boot production mode too.

## Production static files
`server/src/index.ts` serves `path.join(dirname(import.meta.url), '../client/dist')`, which from `server/dist/index.js` resolves to `server/client/dist` — the vite build output (fixed in PR #8; it previously pointed at a repo-root `public/` that nothing created). Run `cd server && npm run build` (builds client then server), then in production mode `/` and any unknown non-API route return `index.html` (200) while unknown `/api/*` routes stay 404 JSON. If the client was never built, the server still boots without 500s but serves no SPA.

## Testing generation without an OPENAI_API_KEY
The openai Node SDK (v4) honors `OPENAI_BASE_URL`, so you can exercise the entire request path (express.json → zod validation → rate limiting → SDK HTTP call → `JSON.parse` → React render → print) against a local mock:
1. Run a tiny node http server that answers `POST /v1/chat/completions` with
   `{choices:[{message:{content: JSON.stringify(worksheet)}}]}` where `worksheet` has
   `{title, passage, multipleChoice:[{question,options[4],answer}]x5, shortAnswer:[{question,answer}]x2}`.
2. Start the API with `OPENAI_BASE_URL=http://localhost:8787/v1` and any non-empty `OPENAI_API_KEY`.
3. Prefix the mock strings with something like `MOCKLLM` so evidence clearly distinguishes mocked from real model output, and always report real-model generation as untested.
4. Because the mock returns a fixed fixture, two different generations look identical on screen — correlate with the server log line `Generating worksheet for: { gradeLevel: …, topic: … }` to prove the second request actually happened.
5. Give the mock a configurable delay (e.g. `setTimeout(respond, Number(process.env.MOCK_DELAY_MS||0))`) so the `Generating...` button state / `animate-spin` spinner is observable and screenshot-able; a 4s delay is too short for a screenshot-after-click round trip, 15s is comfortable. Verify the spinner with `svg.animate-spin` → `getAnimations()[0].playState === 'running'`.

## UI controls / styling gotchas
- The grade/topic dropdowns in `WorksheetGenerator.tsx` are **native `<select>`s**; the Radix `components/ui/select.tsx` exists but is not mounted anywhere, so "test the Radix Select" cannot be done through the page. Use the browser tool's `select_option` on them — a plain `click` on a native `<select>` opens an OS-level popup that can make the browser tool hang (`Browser action failed`) and require `restart`.
- Tailwind 4 preflight sets `background-color: transparent` on `select`/`input` (Tailwind 3 did not for `select`), and the selects only carry `border-gray-300` (color, no `border` width class), so in light mode they render as borderless plain text on a transparent background after the Tailwind 4 upgrade, whereas Tailwind 3 showed the browser's default gray field. Compare against `origin/main` in a worktree (`git worktree add /home/ubuntu/lab-main origin/main`, run its vite on another port such as 5174 — it will show the CORS "Unable to connect" banner, which is fine for a styling-only comparison) and flag this kind of diff with side-by-side screenshots.
- Tailwind 4 emits `oklch(...)` colours, so computed-style checks can't compare against `rgb(...)` values from Tailwind 3; compare screenshots or check the class is present + the colour visibly changes. Dark mode toggle = the moon/sun button in the nav; it adds `class="dark"` on `<html>`.

## Testing the Cloudflare Pages function locally
`npx wrangler pages dev server/client/dist --port 8788 --binding OPENAI_API_KEY=...` works out of the box for exercising `functions/api/*` locally (wrangler 4.x preinstalled; it triggers the client build automatically and creates a `.wrangler/` dir to clean up afterwards).

Gotchas seen with wrangler 4.86:
- If the local workerd is older than today, startup fails with `This Worker requires compatibility date "<today>"` — pass `--compatibility-date <date it reports as supported>` (e.g. `2026-05-03`).
- To bind a local KV namespace for the rate limiter: `--kv RATE_LIMIT_KV`. Responses then carry `RateLimit-Limit/Remaining/Reset` headers (fail-open with a warning if the binding is missing).
- To test a handler from a branch that is NOT checked out, copy it to `/tmp/x/functions/api/generate-worksheet.js` next to a copy of `dist/` and run wrangler from `/tmp/x`; the handler imports `openai`, so symlink the repo root `node_modules` into `/tmp/x` or the Functions bundle fails to build.
- The serverless handlers do NOT honor `OPENAI_BASE_URL`, so a valid same-origin POST ends in 500 `Failed to generate worksheet` inside workerd with a dummy key — that still proves CORS/validation/rate-limit passed. Foreign `Origin` → 403 `Origin not allowed`.
- Never `pkill -f <pattern>` from the exec tool if the pattern appears in your own command line (e.g. `pkill -f "server/dist/index.js"` or `"wrangler pages dev"`) — it kills the shell running the command (exit -1) and the rest of the chain never runs. Kill by PID from `ss -ltnp | grep :PORT` instead.

## Grade-level validation
`server/src/middleware/validation.ts` lowercases, trims, strips a trailing `" grade"`, then requires an **exact** match against the allow-list (`k`, `1`..`12`, `1st`..`12th`, `kindergarten`, `elementary`, `middle school`, `high school`). All 13 dropdown labels (`Kindergarten`, `1st Grade` … `12th Grade`) are accepted (verified in PR #6; before it, only `Kindergarten` worked). Junk like `e`, `99th Grade`, `"   "`, `grade`, or a >20-char string returns 400 `Invalid request data` with `Invalid grade level…` / `Grade level must be 20 characters or less`.

## Rate limiting during testing
`server/src/middleware/rateLimiting.ts`: 10 worksheet requests/hour and `express-slow-down` adds `hits * 2s` (up to 30s) after the 3rd request, keyed by **IP only** (the old IP+User-Agent keying — and the unique-UA-per-request sweep trick it enabled — was removed as a security fix in PR #12; rotating UAs no longer resets the bucket). Long-hanging curl requests are usually this, not a hang. Localhost curl (`::ffff:127.0.0.1`) and the browser (`::1`) land in **different buckets**, so curl sweeps won't 429 the browser session and vice versa; to sweep many payloads without delays, restart the API server between batches to reset the in-memory buckets.

## Print / PDF export
`Print Worksheet` calls `window.print()`. In automated Chrome this **blocks the CDP session**, so browser tool calls start failing. Capture the preview with `DISPLAY=:0 scrot -o file.png` and dismiss with `DISPLAY=:0 xdotool key Escape`; the browser tool recovers afterwards.

## Error-response expectations (security)
All three copies now return only `{"error":"Failed to generate worksheet","details":"Please try again. …"}` (Cloudflare's missing-key case returns `Configuration error` / "not configured") and log the upstream detail server-side; the Cloudflare `debug: {hasApiKey, runtime}` payload was removed. When re-testing, point the server at the real OpenAI base URL with a placeholder key and grep the client response for `sk-`, `Incorrect API key`, `platform.openai.com`, `401`, `debug` — all must be absent while the server log still shows the 401.

## Harnessing the serverless copies locally
- `api/generate-worksheet.js` is CommonJS: `require()` it and call with stub `req`/`res` objects (`res.status().json()`), asserting `POST` → 200 and `GET` → 405.
- `functions/api/generate-worksheet.js` is ESM but the repo root has no `"type": "module"`, so Node refuses to import it as `.js` (`Cannot use import statement outside a module`). Copy it to a `.mjs` file **inside the repo** (so `openai` resolves) and import that; build the context as `{ request: new Request(url, {method:'POST', body: JSON.stringify(...)}), env: { OPENAI_API_KEY } }`.

## Devin Secrets Needed
- `OPENAI_API_KEY` — only needed to test real model generation; everything else can be tested with the mock upstream above.
