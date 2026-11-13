// Small formatting helpers for the details page.

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const fullFormatter = new Intl.NumberFormat("en");

export const compactNumber = (value) =>
  typeof value === "number" ? compactFormatter.format(value) : "–";

export const fullNumber = (value) =>
  typeof value === "number" ? fullFormatter.format(value) : "–";

export const percentOf = (part, total) =>
  total > 0 ? Math.round((part / total) * 100) : 0;

// MAL stores people/characters as "Last, First"
export const displayName = (name) => {
  if (!name || !name.includes(", ")) return name || "";
  const [last, first] = name.split(", ");
  return `${first} ${last}`;
};

// "R - 17+ (violence & profanity)" -> "R-17+"
export const shortRating = (rating) =>
  rating ? rating.split(" (")[0].replace(/\s*-\s*/, "-") : null;

// Colour plus a word, so the score never relies on colour alone. Colours are
// the validated status colours (same as the list stats).
export function scoreTier(score, isDarkMode) {
  if (typeof score !== "number") {
    return { label: "Not yet scored", color: isDarkMode ? "#9aa2ab" : "#5f6670" };
  }
  const label =
    score >= 8.5
      ? "Outstanding"
      : score >= 7.5
        ? "Great"
        : score >= 6.5
          ? "Good"
          : score >= 5
            ? "Average"
            : "Poor";
  const color =
    score >= 7.5
      ? isDarkMode
        ? "#1f9d55"
        : "#15803d"
      : score >= 5
        ? isDarkMode
          ? "#e0631a"
          : "#c2410c"
        : isDarkMode
          ? "#e5484d"
          : "#dc2626";
  return { label, color };
}

// Chart colours that must be real values (ApexCharts can't read CSS vars).
// Mirrors the tokens in style.css.
// Two fixed objects (not rebuilt per call), so they're stable dependencies.
const DARK_CHART_THEME = {
  ink: "#e3e6ea",
  muted: "#9aa2ab",
  line: "#3b4047",
  surface: "#1d2024",
  track: "#343940",
  accent: "#5ec4dc",
  highlight: "#e9bd54",
  status: {
    active: "#9061f0",
    completed: "#1f9d55",
    onhold: "#e0631a",
    planned: "#3d85d8",
    dropped: "#e5484d",
  },
};
const LIGHT_CHART_THEME = {
  ink: "#212529",
  muted: "#5f6670",
  line: "#dde0e4",
  surface: "#ffffff",
  track: "#e9ecef",
  accent: "#0b7a91",
  highlight: "#a86500",
  status: {
    active: "#7c3aed",
    completed: "#15803d",
    onhold: "#c2410c",
    planned: "#2f6fb5",
    dropped: "#dc2626",
  },
};

export const chartTheme = (isDarkMode) =>
  isDarkMode ? DARK_CHART_THEME : LIGHT_CHART_THEME;
