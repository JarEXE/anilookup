import React from "react";
import LazyChart from "./charts/LazyChart";
import { chartTheme, compactNumber, scoreTier } from "./format";

// Score out of 10 as an animated arc. The number and its label are real text
// in the middle (shown immediately, readable by screen readers); only the
// arc comes from ApexCharts, which loads lazily.
function ScoreGauge({ score, scoredBy, isDarkMode }) {
  const hasScore = typeof score === "number";
  const tier = scoreTier(score, isDarkMode);
  const theme = chartTheme(isDarkMode);

  const options = React.useMemo(
    () => ({
      chart: {
        sparkline: { enabled: true },
        animations: { enabled: true, speed: 1100 },
      },
      plotOptions: {
        radialBar: {
          startAngle: -130,
          endAngle: 130,
          hollow: { size: "70%" },
          track: { background: theme.track, strokeWidth: "100%", margin: 0 },
          dataLabels: { show: false },
        },
      },
      stroke: { lineCap: "round" },
      colors: [tier.color],
      tooltip: { enabled: false },
      states: {
        hover: { filter: { type: "none" } },
        active: { filter: { type: "none" } },
      },
    }),
    [theme.track, tier.color],
  );

  const placeholder = <div className="score-gauge__placeholder" />;

  return (
    <figure className="score-gauge">
      <div className="score-gauge__chart" aria-hidden="true">
        {hasScore ? (
          <LazyChart
            type="radialBar"
            series={[score * 10]}
            options={options}
            height="100%"
            width="100%"
            fallback={placeholder}
          />
        ) : (
          placeholder
        )}
      </div>
      <div className="score-gauge__value">
        <span className="visually-hidden">Score: </span>
        <strong>{hasScore ? score.toFixed(2) : "–"}</strong>
        <span className="score-gauge__tier">{tier.label}</span>
      </div>
      <figcaption className="score-gauge__caption">
        {scoredBy ? `${compactNumber(scoredBy)} ratings` : "No ratings yet"}
      </figcaption>
    </figure>
  );
}

export default ScoreGauge;
