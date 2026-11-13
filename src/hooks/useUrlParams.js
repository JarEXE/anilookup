import { useSearchParams } from "react-router-dom";

export default function useUrlParams(defaults) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = {};
  for (const [key, defaultValue] of Object.entries(defaults)) {
    values[key] = searchParams.get(key) ?? defaultValue;
  }

  const update = (changes, { replace = false } = {}) => {
    const next = new URLSearchParams(searchParams);

    for (const [key, value] of Object.entries(changes)) {
      if (
        value === null ||
        typeof value === "undefined" ||
        (key in defaults && String(value) === String(defaults[key]))
      ) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    }

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace });
    }
  };

  return [values, update];
}

// Parses a ?page= value, falling back to 1 for anything that isn't a positive
export function parsePage(value) {
  const page = parseInt(value, 10);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
