import { useCallback, useRef } from "react";
import toast from "react-hot-toast";

// Returns a stable `notify(message, options)` function that styles toasts for
// the current theme.
//
// The toast helpers used to be useCallback'd on `isDarkMode` and listed as
// dependencies of the data-fetching effects, so toggling dark mode re-fetched
// the whole page. This function's identity never changes; it reads the latest
// theme at the moment the toast is shown.
export default function useNotify(isDarkMode) {
  const isDarkModeRef = useRef(isDarkMode);
  isDarkModeRef.current = isDarkMode;

  return useCallback((message, { type, icon = "⚠️" } = {}) => {
    const style = {
      borderRadius: "10px",
      background: `${isDarkModeRef.current ? "var(--d-surface-2)" : "#333"}`,
      color: `${isDarkModeRef.current ? "var(--d-ink)" : "#fff"}`,
    };

    if (type === "error") {
      toast.error(message, { style });
    } else if (type === "success") {
      toast.success(message, { style });
    } else {
      toast(message, { icon, style });
    }
  }, []);
}
