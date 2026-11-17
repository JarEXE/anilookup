import axios from "axios";

export const API_URL = process.env.REACT_APP_API_URL;

// Tenrai rate-limits bursts of requests (HTTP 429). Instead of failing (which
// used to leave pages on an endless spinner), requests are retried a few times,
// waiting as long as the API asks via the Retry-After header, or backing off
// 1s, 2s, 4s when it doesn't say.
const MAX_RETRIES = 3;
const MAX_WAIT_MS = 10000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelay(attempt, retryAfter) {
  const seconds = parseFloat(retryAfter);
  if (!Number.isNaN(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, MAX_WAIT_MS);
  }
  return 1000 * 2 ** attempt;
}

// Tenrai doesn't publish its limits, so requests are also spaced out up front
// (at most about 3 a second and 50 a minute across the whole app). Pages that
// load several sections at once then queue politely instead of bursting into
// a 429. Responses the browser already has cached still pass through here,
// which keeps this on the safe side.
const MIN_GAP_MS = 350;
const PER_MINUTE = 50;
const recentStarts = [];
let queue = Promise.resolve();

// Resolves when this request may start. Requests take turns in call order.
export function waitForSlot() {
  const turn = queue.then(async () => {
    for (;;) {
      const now = Date.now();
      while (recentStarts.length && now - recentStarts[0] >= 60000) {
        recentStarts.shift();
      }
      const last = recentStarts[recentStarts.length - 1] || 0;
      const wait = Math.max(
        last + MIN_GAP_MS - now,
        recentStarts.length >= PER_MINUTE ? recentStarts[0] + 60000 - now : 0,
      );
      if (wait <= 0) break;
      await sleep(wait);
    }
    recentStarts.push(Date.now());
  });
  queue = turn;
  return turn;
}

// Drop-in replacement for fetch() for Tenrai API calls.
export async function apiFetch(url, options) {
  for (let attempt = 0; ; attempt++) {
    await waitForSlot();
    const response = await fetch(url, options);
    if (response.status !== 429 || attempt >= MAX_RETRIES) {
      return response;
    }
    await sleep(retryDelay(attempt, response.headers.get("Retry-After")));
  }
}

// Drop-in replacement for axios for Tenrai API calls.
export const apiClient = axios.create();

apiClient.interceptors.request.use(async (config) => {
  await waitForSlot();
  return config;
});

apiClient.interceptors.response.use(undefined, async (error) => {
  const { config, response } = error;
  if (!config || !response || response.status !== 429) {
    throw error;
  }

  const attempt = config.__retryCount || 0;
  if (attempt >= MAX_RETRIES) {
    throw error;
  }

  await sleep(retryDelay(attempt, response.headers["retry-after"]));
  return apiClient({ ...config, __retryCount: attempt + 1 });
});
