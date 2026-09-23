import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  onRequestOptions,
  onRequestPost,
} from "../functions/api/generate-worksheet.js";

const ORIGIN = "https://learninglab.example";
const WORKSHEET = {
  title: "Volcanoes",
  passage: "Volcanoes are openings in the crust.",
  multipleChoice: [
    {
      question: "What is a volcano?",
      options: ["A", "B", "C", "D"],
      answer: "A",
    },
  ],
  shortAnswer: [{ question: "Why do volcanoes erupt?", answer: "Pressure." }],
};

const memoryKv = () => {
  const store = new Map();
  return {
    get: async (key) => store.get(key) ?? null,
    put: async (key, value) => void store.set(key, value),
  };
};

const request = (body, headers = {}) =>
  new Request(`${ORIGIN}/api/generate-worksheet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "CF-Connecting-IP": "203.0.113.7",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const run = (req, env = {}) => {
  const pending = [];
  const context = {
    request: req,
    env: { OPENAI_API_KEY: "test-key", RATE_LIMIT_KV: memoryKv(), ...env },
    waitUntil: (p) => pending.push(p),
  };
  return onRequestPost(context).then(async (res) => {
    await Promise.all(pending);
    return { res, context };
  });
};

const realFetch = globalThis.fetch;
const stubOpenAI = (handler) => {
  globalThis.fetch = async (url, init) => handler(new Request(url, init));
};

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("functions/api/generate-worksheet", () => {
  it("rejects invalid request bodies before calling OpenAI", async () => {
    let calls = 0;
    stubOpenAI(() => {
      calls += 1;
      throw new Error("should not be called");
    });

    for (const body of [
      { gradeLevel: "99th Grade", topic: "Volcanoes" },
      { gradeLevel: "3rd Grade", topic: "ab" },
      { gradeLevel: "3rd Grade", topic: "weapons" },
      { gradeLevel: "3rd Grade", topic: "Volcanoes", complexity: "extreme" },
      {},
    ]) {
      const { res } = await run(request(body));
      assert.equal(res.status, 400, JSON.stringify(body));
    }
    assert.equal(calls, 0);
  });

  it("returns the generated worksheet with rate-limit headers", async () => {
    stubOpenAI(async (req) => {
      assert.equal(req.headers.get("authorization"), "Bearer test-key");
      return Response.json({
        id: "cmpl",
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: JSON.stringify(WORKSHEET) },
          },
        ],
      });
    });

    const { res } = await run(
      request({ gradeLevel: "3rd Grade", topic: "Volcanoes" }),
    );
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), WORKSHEET);
    assert.equal(res.headers.get("RateLimit-Limit"), "10");
    assert.equal(res.headers.get("RateLimit-Remaining"), "9");
  });

  it("masks upstream failures", async () => {
    stubOpenAI(
      async () => new Response("secret upstream detail", { status: 401 }),
    );

    const { res } = await run(
      request({ gradeLevel: "3rd Grade", topic: "Volcanoes" }),
    );
    assert.equal(res.status, 500);
    const body = await res.json();
    assert.equal(body.error, "Failed to generate worksheet");
    assert.doesNotMatch(JSON.stringify(body), /secret upstream detail/);
  });

  it("limits each IP to 10 worksheets per window", async () => {
    stubOpenAI(async () =>
      Response.json({
        id: "cmpl",
        object: "chat.completion",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: JSON.stringify(WORKSHEET) },
          },
        ],
      }),
    );
    const kv = memoryKv();
    for (let i = 0; i < 10; i += 1) {
      const { res } = await run(
        request({ gradeLevel: "3rd Grade", topic: "Volcanoes" }),
        {
          RATE_LIMIT_KV: kv,
        },
      );
      assert.equal(res.status, 200, `request ${i + 1}`);
    }
    const { res } = await run(
      request({ gradeLevel: "3rd Grade", topic: "Volcanoes" }),
      {
        RATE_LIMIT_KV: kv,
      },
    );
    assert.equal(res.status, 429);
    assert.equal(res.headers.get("RateLimit-Remaining"), "0");
    assert.ok(res.headers.get("Retry-After"));
  });

  it("allows same-origin and allow-listed origins only", async () => {
    const body = { gradeLevel: "3rd Grade", topic: "Volcanoes" };

    const foreign = await run(
      request(body, { Origin: "https://evil.example" }),
    );
    assert.equal(foreign.res.status, 403);

    const preflight = await onRequestOptions({
      request: new Request(`${ORIGIN}/api/generate-worksheet`, {
        method: "OPTIONS",
        headers: { Origin: "https://evil.example" },
      }),
      env: {},
    });
    assert.equal(preflight.status, 403);

    const listed = await onRequestOptions({
      request: new Request(`${ORIGIN}/api/generate-worksheet`, {
        method: "OPTIONS",
        headers: { Origin: "https://partner.example" },
      }),
      env: { ALLOWED_ORIGINS: "https://partner.example" },
    });
    assert.equal(listed.status, 204);
    assert.equal(
      listed.headers.get("Access-Control-Allow-Origin"),
      "https://partner.example",
    );

    const same = await onRequestOptions({
      request: new Request(`${ORIGIN}/api/generate-worksheet`, {
        method: "OPTIONS",
        headers: { Origin: ORIGIN },
      }),
      env: {},
    });
    assert.equal(same.status, 204);
    assert.equal(same.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  });
});
