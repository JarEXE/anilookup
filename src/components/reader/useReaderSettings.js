import React from "react";

const KEY = "reader:settings";
// the reader's high-quality switch used to be stored on its own
const OLD_HIGH_QUALITY_KEY = "reader:highQuality";

export const LAYOUTS = [
  { value: "strip", label: "Long strip" },
  { value: "single", label: "Single page" },
  { value: "double", label: "Double page" },
];
export const DIRECTIONS = [
  { value: "ltr", label: "Left to right" },
  { value: "rtl", label: "Right to left" },
];

const DEFAULTS = { layout: "strip", direction: "ltr", highQuality: false };

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY)) || {};
    const settings = {
      ...DEFAULTS,
      highQuality: localStorage.getItem(OLD_HIGH_QUALITY_KEY) === "1",
      ...saved,
    };
    // anything unknown (an older or edited value) falls back to the default
    if (!LAYOUTS.some((l) => l.value === settings.layout)) settings.layout = DEFAULTS.layout;
    if (!DIRECTIONS.some((d) => d.value === settings.direction)) settings.direction = DEFAULTS.direction;
    settings.highQuality = Boolean(settings.highQuality);
    return settings;
  } catch (error) {
    return DEFAULTS;
  }
}

// The reader's settings, remembered on this device:
// { layout: "strip" | "single" | "double", direction: "ltr" | "rtl", highQuality }
export default function useReaderSettings() {
  const [settings, setSettings] = React.useState(read);
  const update = React.useCallback((changes) => {
    setSettings((current) => {
      const next = { ...current, ...changes };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch (error) {
        // the choice just won't be remembered
      }
      return next;
    });
  }, []);
  return [settings, update];
}

export function useMediaQuery(query) {
  const get = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia(query).matches;
  const [matches, setMatches] = React.useState(get);
  React.useEffect(() => {
    if (!window.matchMedia) return undefined;
    const list = window.matchMedia(query);
    const onChange = () => setMatches(list.matches);
    onChange();
    list.addEventListener("change", onChange);
    return () => list.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}
