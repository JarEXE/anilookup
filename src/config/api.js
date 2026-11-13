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

// Drop-in replacement for fetch() for Tenrai API calls.
export async function apiFetch(url, options) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url, options);
    if (response.status !== 429 || attempt >= MAX_RETRIES) {
      return response;
    }
    await sleep(retryDelay(attempt, response.headers.get("Retry-After")));
  }
}

// Drop-in replacement for axios for Tenrai API calls.
export const apiClient = axios.create();

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
