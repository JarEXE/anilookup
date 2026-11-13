import {
  faCircleCheck,
  faEye,
  faBookOpen,
  faCircleXmark,
  faHand,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

// Segment order is deliberate: red (dropped) and green (completed) are never
// next to each other, so neighbouring segments stay distinguishable for
// colour-blind users. Colours live in style.css (--status-*), validated for
// both themes.
export function getStatuses(type) {
  const isAnime = type === "anime";
  return [
    {
      key: isAnime ? "watching" : "reading",
      label: isAnime ? "Watching" : "Reading",
      icon: isAnime ? faEye : faBookOpen,
      colorVar: "--status-active",
    },
    {
      key: "completed",
      label: "Completed",
      icon: faCircleCheck,
      colorVar: "--status-completed",
    },
    {
      key: "onhold",
      label: "On-Hold",
      icon: faHand,
      colorVar: "--status-onhold",
    },
    {
      key: "planned",
      label: isAnime ? "Plan to Watch" : "Plan to Read",
      icon: faClock,
      colorVar: "--status-planned",
    },
    {
      key: "dropped",
      label: "Dropped",
      icon: faCircleXmark,
      colorVar: "--status-dropped",
    },
  ];
}

export const listUrl = (type, status) =>
  `/lists?type=${type}${status ? `&status=${status}` : ""}`;
