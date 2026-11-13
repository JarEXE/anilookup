import React from "react";
import LazyChart from "./charts/LazyChart";
import LoadError from "../plugins/LoadError";
import useApiResource, { useEpisodes } from "./useApiResource";
import { chartTheme, compactNumber, fullNumber, percentOf } from "./format";

const STATUS_ORDER_BY_TYPE = {};
// fixed per type (same array every call), so it's a stable dependency
const STATUS_ORDER = (type) =>
  STATUS_ORDER_BY_TYPE[type] || (STATUS_ORDER_BY_TYPE[type] = [
  { key: type === "anime" ? "watching" : "reading", label: type === "anime" ? "Watching" : "Reading", color: "active" },
  { key: "completed", label: "Completed", color: "completed" },
  { key: "on_hold", label: "On-Hold", color: "onhold" },
  { key: type === "anime" ? "plan_to_watch" : "plan_to_read", label: type === "anime" ? "Plan to Watch" : "Plan to Read", color: "planned" },
  { key: "dropped", label: "Dropped", color: "dropped" },
]);

const axisStyle = (theme) => ({ colors: theme.muted, fontSize: "12px" });

function ChartSkeleton({ height }) {
  return <div className="details-chart-skeleton" style={{ height }} />;
}

// ---------- member status ----------

function MemberStatus({ stats, type, isDarkMode }) {
  const theme = chartTheme(isDarkMode);
  const statuses = STATUS_ORDER(type);
  const total = stats.total || statuses.reduce((sum, s) => sum + (stats[s.key] || 0), 0);

  const options = React.useMemo(
    () => ({
      chart: {
        stacked: true,
        stackType: "100%",
        toolbar: { show: false },
        parentHeightOffset: 0,
        fontFamily: "inherit",
      },
      plotOptions: { bar: { horizontal: true, barHeight: "100%", borderRadius: 4, borderRadiusWhenStacked: "all" } },
      // a 2px surface gap between segments
      stroke: { width: 2, colors: [theme.surface] },
      colors: statuses.map((s) => theme.status[s.color]),
      dataLabels: { enabled: false },
      legend: { show: false }, // the labelled list below is the legend
      grid: { show: false, padding: { top: -18, bottom: -14, left: -8, right: 0 } },
      xaxis: { categories: ["Members"], labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { show: false } },
      tooltip: {
        theme: isDarkMode ? "dark" : "light",
        y: { formatter: (value) => `${fullNumber(value)} (${percentOf(value, total)}%)` },
      },
    }),
    [theme, statuses, total, isDarkMode],
  );

  return (
    <section className="details-card" aria-labelledby="status-heading">
      <h3 className="details-card__title" id="status-heading">
        What members are doing
      </h3>
      <p className="details-card__lead">
        {fullNumber(total)} people have this on their MAL list.
      </p>
      <div className="details-status-chart" aria-hidden="true">
        <LazyChart
          type="bar"
          height={56}
          series={statuses.map((s) => ({ name: s.label, data: [stats[s.key] || 0] }))}
          options={options}
          fallback={<ChartSkeleton height={56} />}
        />
      </div>
      <ul className="details-legend">
        {statuses.map((s) => (
          <li key={s.key}>
            <span className="details-legend__swatch" style={{ background: theme.status[s.color] }} />
            <span className="details-legend__label">{s.label}</span>
            <span className="details-legend__value">
              {percentOf(stats[s.key] || 0, total)}%
              <small>{compactNumber(stats[s.key] || 0)}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------- score distribution ----------

function ScoreDistribution({ stats, score, isDarkMode }) {
  const theme = chartTheme(isDarkMode);
  const scores = (stats.scores || []).slice().sort((a, b) => a.score - b.score);
  const totalVotes = scores.reduce((sum, s) => sum + s.votes, 0);
  const top = scores.reduce((best, s) => (!best || s.votes > best.votes ? s : best), null);

  const options = React.useMemo(
    () => ({
      chart: { toolbar: { show: false }, parentHeightOffset: 0, fontFamily: "inherit" },
      plotOptions: { bar: { columnWidth: "62%", borderRadius: 4, borderRadiusApplication: "end" } },
      colors: [theme.accent],
      dataLabels: { enabled: false },
      grid: { borderColor: theme.line, strokeDashArray: 3, padding: { left: 4, right: 4 } },
      xaxis: {
        categories: scores.map((s) => String(s.score)),
        labels: { style: axisStyle(theme) },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: { text: "Score", style: { color: theme.muted, fontWeight: 400 } },
      },
      yaxis: {
        labels: { style: axisStyle(theme), formatter: (value) => compactNumber(value) },
      },
      tooltip: {
        theme: isDarkMode ? "dark" : "light",
        x: { formatter: (value) => `Scored ${value}` },
        y: {
          formatter: (value) => `${fullNumber(value)} votes (${percentOf(value, totalVotes)}%)`,
          title: { formatter: () => "" },
        },
      },
      states: { hover: { filter: { type: "darken", value: 0.85 } } },
    }),
    [theme, scores, totalVotes, isDarkMode],
  );

  if (!scores.length) return null;

  return (
    <section className="details-card" aria-labelledby="scores-heading">
      <h3 className="details-card__title" id="scores-heading">
        How people scored it
      </h3>
      <p className="details-card__lead">
        Most common score: <strong>{top.score}</strong> ({percentOf(top.votes, totalVotes)}% of{" "}
        {compactNumber(totalVotes)} votes)
        {typeof score === "number" ? <>, average {score.toFixed(2)}</> : null}.
      </p>
      <div aria-hidden="true">
        <LazyChart
          type="bar"
          height={230}
          series={[{ name: "Votes", data: scores.map((s) => s.votes) }]}
          options={options}
          fallback={<ChartSkeleton height={230} />}
        />
      </div>
      {/* the same numbers for screen readers */}
      <table className="visually-hidden">
        <caption>Votes per score</caption>
        <thead>
          <tr>
            <th scope="col">Score</th>
            <th scope="col">Votes</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s) => (
            <tr key={s.score}>
              <th scope="row">{s.score}</th>
              <td>{fullNumber(s.votes)}</td>
              <td>{percentOf(s.votes, totalVotes)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// ---------- episode scores ----------

function EpisodeScores({ animeId, isDarkMode }) {
  const theme = chartTheme(isDarkMode);
  const { episodes, done, truncated, error, retry } = useEpisodes(animeId, true);
  const scored = episodes.filter((e) => typeof e.score === "number");

  const options = React.useMemo(() => {
    const values = scored.map((e) => e.score);
    const min = values.length ? Math.max(1, Math.floor(Math.min(...values) * 2) / 2) : 1;
    const markedIndexes = episodes
      .map((e, index) => (e.filler || e.recap ? index : -1))
      .filter((index) => index >= 0);

    return {
      chart: {
        toolbar: {
          show: episodes.length > 40,
          tools: { download: false, selection: false, zoom: true, zoomin: true, zoomout: true, pan: false, reset: true },
        },
        zoom: { enabled: episodes.length > 40, type: "x" },
        parentHeightOffset: 0,
        fontFamily: "inherit",
      },
      colors: [theme.accent],
      stroke: { width: 2, curve: "straight" },
      markers: {
        size: episodes.length > 60 ? 0 : 3,
        strokeWidth: 0,
        hover: { size: 6 },
        // filler / recap episodes get a distinct marker
        discrete: markedIndexes.map((index) => ({
          seriesIndex: 0,
          dataPointIndex: index,
          fillColor: theme.highlight,
          strokeColor: theme.surface,
          // smaller on very long shows so the markers don't bury the line
          size: episodes.length > 200 ? 3 : 5,
        })),
      },
      grid: { borderColor: theme.line, strokeDashArray: 3 },
      xaxis: {
        type: "numeric",
        tickAmount: Math.min(10, Math.max(1, episodes.length - 1)),
        decimalsInFloat: 0,
        labels: { style: axisStyle(theme), formatter: (value) => String(Math.round(value)) },
        axisBorder: { show: false },
        axisTicks: { show: false },
        title: { text: "Episode", style: { color: theme.muted, fontWeight: 400 } },
        tooltip: { enabled: false },
      },
      yaxis: {
        min,
        max: 5,
        decimalsInFloat: 1,
        labels: { style: axisStyle(theme) },
        title: { text: "Score (1–5)", style: { color: theme.muted, fontWeight: 400 } },
      },
      tooltip: {
        theme: isDarkMode ? "dark" : "light",
        custom: ({ dataPointIndex }) => {
          const episode = episodes[dataPointIndex];
          if (!episode) return "";
          const flags = [episode.filler ? "Filler" : null, episode.recap ? "Recap" : null].filter(Boolean);
          const escape = (text) => String(text || "").replace(/&/g, "&amp;").replace(/</g, "&lt;");
          return `<div class="details-chart-tooltip"><strong>Episode ${episode.mal_id}</strong>${
            episode.title ? `<span>${escape(episode.title)}</span>` : ""
          }<span>${typeof episode.score === "number" ? `Score ${episode.score.toFixed(2)}` : "No score"}${
            flags.length ? ` (${flags.join(", ")})` : ""
          }</span></div>`;
        },
      },
    };
  }, [episodes, scored, theme, isDarkMode]);

  if (error && episodes.length === 0) {
    return (
      <section className="details-card">
        <h3 className="details-card__title">Episode scores</h3>
        <LoadError isDarkMode={isDarkMode} message="Couldn't load episodes." onRetry={retry} minHeight="160px" />
      </section>
    );
  }
  if (done && scored.length === 0) {
    return episodes.length ? (
      <section className="details-card">
        <h3 className="details-card__title">Episode scores</h3>
        <p className="details-muted">No episode ratings yet.</p>
      </section>
    ) : null;
  }

  const best = scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const hasMarked = episodes.some((e) => e.filler || e.recap);

  return (
    <section className="details-card details-card--wide" aria-labelledby="episodes-heading">
      <h3 className="details-card__title" id="episodes-heading">
        Episode scores
      </h3>
      <p className="details-card__lead">
        How viewers rated each episode on MAL (1–5).
        {!done ? ` Loading episodes… (${episodes.length} so far)` : null}
        {truncated ? ` Showing the first ${episodes.length} episodes.` : null}
      </p>
      {hasMarked ? (
        <p className="details-legend details-legend--inline">
          <span className="details-legend__swatch details-legend__swatch--dot" style={{ background: theme.highlight }} />
          Filler or recap episode
        </p>
      ) : null}
      <div aria-hidden="true">
        {scored.length ? (
          <LazyChart
            type="line"
            height={260}
            series={[{ name: "Episode score", data: episodes.map((e) => ({ x: e.mal_id, y: typeof e.score === "number" ? e.score : null })) }]}
            options={options}
            fallback={<ChartSkeleton height={260} />}
          />
        ) : (
          <ChartSkeleton height={260} />
        )}
      </div>
      {best.length ? (
        <>
          <h4 className="details-subheading">Top rated episodes</h4>
          <ol className="details-top-episodes">
            {best.map((episode) => (
              <li key={episode.mal_id}>
                <span className="details-top-episodes__number">Ep {episode.mal_id}</span>
                <span className="details-top-episodes__title">{episode.title || "Untitled"}</span>
                <span className="details-top-episodes__score">{episode.score.toFixed(2)}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </section>
  );
}

// ---------- tab ----------

function StatsTab({ details, type, isDarkMode }) {
  const { data: stats, status, retry } = useApiResource(`/${type}/${details.mal_id}/statistics`);
  const statuses = STATUS_ORDER(type);

  let summary = null;
  if (stats) {
    const total = stats.total || 0;
    const tiles = [
      { label: "Finished it", value: `${percentOf(stats.completed || 0, total)}%` },
      { label: type === "anime" ? "Watching now" : "Reading now", value: `${percentOf(stats[statuses[0].key] || 0, total)}%` },
      { label: "Dropped it", value: `${percentOf(stats.dropped || 0, total)}%` },
      { label: "Plan to start", value: `${percentOf(stats[statuses[3].key] || 0, total)}%` },
    ];
    summary = (
      <dl className="details-stat-tiles">
        {tiles.map((tile) => (
          <div key={tile.label}>
            <dt>{tile.label}</dt>
            <dd>{tile.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <div className="details-stats">
      <h2 className="visually-hidden">Stats</h2>
      {status === "error" ? (
        <LoadError isDarkMode={isDarkMode} message="Couldn't load the stats." onRetry={retry} />
      ) : !stats ? (
        <div className="details-stats__grid">
          <ChartSkeleton height={220} />
          <ChartSkeleton height={220} />
        </div>
      ) : (
        <>
          {summary}
          <div className="details-stats__grid">
            <ScoreDistribution stats={stats} score={details.score} isDarkMode={isDarkMode} />
            <MemberStatus stats={stats} type={type} isDarkMode={isDarkMode} />
          </div>
        </>
      )}
      {type === "anime" ? <EpisodeScores animeId={details.mal_id} isDarkMode={isDarkMode} /> : null}
    </div>
  );
}

export default StatsTab;
