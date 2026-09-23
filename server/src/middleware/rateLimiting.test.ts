import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const modulePath = fileURLToPath(new URL('./rateLimiting.ts', import.meta.url));

// The limits are read once at module load, so each case runs in a fresh process.
const load = (env: Record<string, string>) =>
  spawnSync(
    process.execPath,
    [
      '--import',
      'tsx',
      '--input-type=module',
      '-e',
      `import * as m from ${JSON.stringify(modulePath)};
       console.log(JSON.stringify({
         w: m.WORKSHEET_RATE_LIMIT_WINDOW_MS, wm: m.WORKSHEET_RATE_LIMIT_MAX_REQUESTS,
         g: m.GENERAL_RATE_LIMIT_WINDOW_MS, gm: m.GENERAL_RATE_LIMIT_MAX_REQUESTS,
       }));`,
    ],
    { encoding: 'utf8', env: { ...process.env, ...env } }
  );

describe('rate limit configuration', () => {
  it('falls back to the documented defaults', () => {
    const result = load({
      WORKSHEET_RATE_LIMIT_WINDOW_MS: '',
      WORKSHEET_RATE_LIMIT_MAX_REQUESTS: '',
      GENERAL_RATE_LIMIT_WINDOW_MS: '',
      GENERAL_RATE_LIMIT_MAX_REQUESTS: '',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { w: 3_600_000, wm: 10, g: 900_000, gm: 100 });
  });

  it('reads overrides from the environment', () => {
    const result = load({
      WORKSHEET_RATE_LIMIT_WINDOW_MS: '60000',
      WORKSHEET_RATE_LIMIT_MAX_REQUESTS: '2',
      GENERAL_RATE_LIMIT_WINDOW_MS: '30000',
      GENERAL_RATE_LIMIT_MAX_REQUESTS: '5',
    });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { w: 60_000, wm: 2, g: 30_000, gm: 5 });
  });

  it('refuses to start with a non-positive or non-integer limit', () => {
    for (const bad of ['0', '-5', '1.5', 'ten']) {
      const result = load({ WORKSHEET_RATE_LIMIT_MAX_REQUESTS: bad });
      assert.notEqual(result.status, 0, bad);
      assert.match(result.stderr, /WORKSHEET_RATE_LIMIT_MAX_REQUESTS must be a positive integer/);
    }
  });
});
