import React from "react";

const ApexChart = React.lazy(() => import("./ApexChart"));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Renders an ApexCharts chart once the (lazy) library has loaded. Until then
// the `fallback` holds the same space, so nothing jumps. Animations are
// switched off for people who prefer reduced motion.
function LazyChart({ fallback = null, options, ...props }) {
  const finalOptions = React.useMemo(() => {
    if (!prefersReducedMotion()) return options;
    return {
      ...options,
      chart: { ...(options.chart || {}), animations: { enabled: false } },
    };
  }, [options]);

  return (
    <React.Suspense fallback={fallback}>
      <ApexChart options={finalOptions} {...props} />
    </React.Suspense>
  );
}

export default LazyChart;
